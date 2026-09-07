#!/usr/bin/env node
/**
 * Merge directions chips into schedule_section, delete directions collection.
 *
 *   DIRECTUS_URL=http://127.0.0.1:8055 npm run directus:merge-schedule
 */
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

function loadEnvFile(path) {
  if (!existsSync(path)) return
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (!m || process.env[m[1]]) continue
    process.env[m[1]] = m[2]
  }
}
loadEnvFile(resolve(ROOT, '.env'))

const BASE = (process.env.DIRECTUS_URL || 'http://127.0.0.1:8055').replace(/\/$/, '')
const EMAIL = process.env.DIRECTUS_ADMIN_EMAIL
const PASSWORD = process.env.DIRECTUS_ADMIN_PASSWORD

if (!EMAIL || !PASSWORD) {
  console.error('Need DIRECTUS_ADMIN_EMAIL and DIRECTUS_ADMIN_PASSWORD')
  process.exit(1)
}

const CHIPS_SEED = [
  { label: 'Живопись', style_key: 'paint' },
  { label: 'Графика', style_key: 'graphic' },
  { label: 'Рисунок', style_key: 'draw' },
  { label: 'Дизайн', style_key: 'design' },
  { label: 'Лепка', style_key: 'sculpt' },
]

const CHIP_LIST_OPTIONS = {
  template: '{{label}}',
  fields: [
    { field: 'label', name: 'Название', type: 'string', meta: { interface: 'input', width: 'half', required: true } },
    {
      field: 'style_key',
      name: 'Стиль',
      type: 'string',
      meta: {
        interface: 'select-dropdown',
        width: 'half',
        options: {
          choices: [
            { text: 'Живопись', value: 'paint' },
            { text: 'Графика', value: 'graphic' },
            { text: 'Рисунок', value: 'draw' },
            { text: 'Дизайн', value: 'design' },
            { text: 'Лепка', value: 'sculpt' },
          ],
        },
      },
    },
  ],
}

async function api(token, method, path, body) {
  const headers = { Accept: 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  let payload
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }
  const res = await fetch(`${BASE}${path}`, { method, headers, body: payload })
  const text = await res.text()
  let json
  try {
    json = text ? JSON.parse(text) : null
  } catch {
    json = { raw: text }
  }
  if (!res.ok) {
    const err = new Error(`${method} ${path} → ${res.status}`)
    err.detail = json
    throw err
  }
  return json
}

async function loginToken() {
  return (await api(null, 'POST', '/auth/login', { email: EMAIL, password: PASSWORD })).data
    .access_token
}

function parseMaybeJson(value, fallback) {
  if (value == null) return fallback
  if (typeof value === 'object') return value
  if (typeof value === 'string') {
    try {
      return JSON.parse(value)
    } catch {
      return fallback
    }
  }
  return fallback
}

async function main() {
  console.log(`Merge schedule ← directions → ${BASE}`)
  const token = await loginToken()

  let chips = CHIPS_SEED
  try {
    const dirs = (await api(token, 'GET', '/items/directions?sort=sort&limit=-1')).data || []
    const fromDirs = dirs
      .filter((d) => (!d.status || d.status === 'published') && (!d.kind || d.kind === 'chip'))
      .map((d) => ({ label: d.label, style_key: d.style_key || '' }))
      .filter((d) => d.label)
    if (fromDirs.length) chips = fromDirs
  } catch {
    console.log('  directions missing — using seed chips')
  }

  const fields = await api(token, 'GET', '/fields/schedule_section')
  const have = new Map((fields.data || []).map((f) => [f.field, f]))
  if (have.has('chips')) {
    await api(token, 'PATCH', '/fields/schedule_section/chips', {
      meta: {
        interface: 'list',
        special: ['cast-json'],
        options: CHIP_LIST_OPTIONS,
        note: 'Чему учим — чипы направлений',
        translations: [{ language: 'ru-RU', translation: 'Чему учим' }],
      },
    })
    console.log('  updated schedule_section.chips')
  } else {
    await api(token, 'POST', '/fields/schedule_section', {
      field: 'chips',
      type: 'json',
      schema: {},
      meta: {
        interface: 'list',
        special: ['cast-json'],
        options: CHIP_LIST_OPTIONS,
        note: 'Чему учим — чипы направлений',
        translations: [{ language: 'ru-RU', translation: 'Чему учим' }],
        width: 'full',
      },
    })
    console.log('  created schedule_section.chips')
  }

  const schedule = (await api(token, 'GET', '/items/schedule_section')).data || {}
  const existingChips = parseMaybeJson(schedule.chips, [])
  const useChips =
    Array.isArray(existingChips) &&
    existingChips.length &&
    existingChips.every((c) => c && typeof c === 'object' && c.label)
      ? existingChips
      : chips

  await api(token, 'PATCH', '/items/schedule_section', {
    eyebrow: 'Занятия',
    title: 'Чему учим и когда приходить',
    lead:
      'Живопись, графика, рисунок, дизайн и лепка — в группах по возрастам. Уметь рисовать заранее не нужно. Актуально на август 2026 — свободные места уточняйте при записи.',
    chips: useChips,
  })
  console.log(`  seeded chips (${useChips.length}) + section copy`)

  await api(token, 'PATCH', '/collections/schedule_section', {
    meta: {
      icon: 'calendar_month',
      singleton: true,
      note: 'Чему учим, группы и расписание',
      translations: [
        { language: 'ru-RU', translation: 'Занятия', singular: 'Занятия', plural: 'Занятия' },
      ],
    },
  })
  console.log('  labeled schedule_section → Занятия')

  try {
    await api(token, 'DELETE', '/collections/directions')
    console.log('  deleted directions')
  } catch (e) {
    console.warn('  skip delete directions', e.message)
  }

  try {
    await api(token, 'POST', '/utils/cache/clear', {})
  } catch {
    // optional
  }

  console.log('Done.')
}

main().catch((e) => {
  console.error(e.message)
  if (e.detail) console.error(JSON.stringify(e.detail, null, 2))
  process.exit(1)
})
