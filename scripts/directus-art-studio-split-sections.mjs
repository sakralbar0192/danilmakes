#!/usr/bin/env node
/**
 * Split section headings out of site_settings into focused singletons:
 *   schedule_section, pricing, works, trial
 *
 *   DIRECTUS_URL=http://127.0.0.1:8055 npm run directus:split-sections
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

const SECTIONS = [
  {
    collection: 'schedule_section',
    meta: { icon: 'calendar_month', singleton: true, note: 'Заголовки блока «Расписание»' },
    fields: [
      { field: 'eyebrow', type: 'string' },
      { field: 'title', type: 'string' },
      { field: 'lead', type: 'text' },
    ],
    from: {
      eyebrow: 'schedule_eyebrow',
      title: 'schedule_title',
      lead: 'schedule_lead',
    },
  },
  {
    collection: 'pricing',
    meta: { icon: 'payments', singleton: true, note: 'Заголовки блока «Цены» (тарифы — в Prices)' },
    fields: [
      { field: 'eyebrow', type: 'string' },
      { field: 'title', type: 'string' },
    ],
    from: {
      eyebrow: 'prices_eyebrow',
      title: 'prices_title',
    },
  },
  {
    collection: 'works',
    meta: { icon: 'photo_library', singleton: true, note: 'Заголовки ленты работ на главной' },
    fields: [
      { field: 'eyebrow', type: 'string' },
      { field: 'title', type: 'string' },
    ],
    from: {
      eyebrow: 'works_eyebrow',
      title: 'works_title',
    },
  },
  {
    collection: 'trial',
    meta: { icon: 'edit_calendar', singleton: true, note: 'Блок записи на пробное' },
    fields: [
      { field: 'eyebrow', type: 'string' },
      { field: 'title', type: 'string' },
      { field: 'lead', type: 'text' },
    ],
    from: {
      eyebrow: 'trial_eyebrow',
      title: 'trial_title',
      lead: 'trial_lead',
    },
  },
]

const HIDE_FROM_SETTINGS = [
  'schedule_eyebrow',
  'schedule_title',
  'schedule_lead',
  'prices_eyebrow',
  'prices_title',
  'works_eyebrow',
  'works_title',
  'trial_eyebrow',
  'trial_title',
  'trial_lead',
]

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
  const json = await api(null, 'POST', '/auth/login', { email: EMAIL, password: PASSWORD })
  return json.data.access_token
}

async function fieldsOf(token, collection) {
  const list = await api(token, 'GET', `/fields/${collection}`)
  return new Map((list.data || []).map((f) => [f.field, f]))
}

async function ensureCollection(token, spec) {
  const list = await api(token, 'GET', '/collections')
  if ((list.data || []).some((c) => c.collection === spec.collection)) {
    console.log(`  skip collection ${spec.collection}`)
    return
  }
  await api(token, 'POST', '/collections', {
    collection: spec.collection,
    meta: spec.meta,
    schema: {},
    fields: [
      {
        field: 'id',
        type: 'integer',
        meta: { hidden: true },
        schema: { is_primary_key: true, has_auto_increment: true },
      },
    ],
  })
  console.log(`  created collection ${spec.collection}`)
}

async function ensureStringField(token, collection, field, type = 'string') {
  const map = await fieldsOf(token, collection)
  if (map.has(field)) {
    console.log(`  skip ${collection}.${field}`)
    return
  }
  await api(token, 'POST', `/fields/${collection}`, {
    field,
    type,
    schema: {},
    meta: {
      interface: type === 'text' ? 'input-multiline' : 'input',
      width: 'full',
    },
  })
  console.log(`  created ${collection}.${field}`)
}

async function ensurePublicRead(token, collections) {
  const policies = await api(token, 'GET', '/policies?limit=-1')
  const pub = (policies.data || []).find(
    (p) => p.name === '$t:public_label' || p.name === 'Public',
  )
  if (!pub) throw new Error('no public policy')
  const existing = await api(
    token,
    'GET',
    `/permissions?filter[policy][_eq]=${pub.id}&limit=-1`,
  )
  const have = new Set((existing.data || []).map((p) => `${p.collection}:${p.action}`))
  for (const collection of collections) {
    const key = `${collection}:read`
    if (have.has(key)) {
      console.log(`  skip public read ${collection}`)
      continue
    }
    await api(token, 'POST', '/permissions', {
      policy: pub.id,
      collection,
      action: 'read',
      fields: ['*'],
    })
    console.log(`  public read ${collection}`)
  }
}

async function hideField(token, collection, field) {
  const map = await fieldsOf(token, collection)
  if (!map.has(field)) return
  await api(token, 'PATCH', `/fields/${collection}/${field}`, {
    meta: {
      hidden: true,
      note: 'Устарело: перенесено в отдельную коллекцию секции',
    },
  })
  console.log(`  hid ${collection}.${field}`)
}

async function migrateSection(token, section, settings) {
  await ensureCollection(token, section)
  for (const f of section.fields) {
    await ensureStringField(token, section.collection, f.field, f.type)
  }
  const cur = (await api(token, 'GET', `/items/${section.collection}`)).data || {}
  const patch = {}
  for (const [dest, src] of Object.entries(section.from)) {
    patch[dest] = cur[dest] || settings[src] || null
  }
  await api(token, 'PATCH', `/items/${section.collection}`, patch)
  console.log(`  migrated ${section.collection}`, patch)
}

async function main() {
  console.log(`Split sections → ${BASE}`)
  const token = await loginToken()
  const settings = (await api(token, 'GET', '/items/site_settings')).data || {}

  for (const section of SECTIONS) {
    await migrateSection(token, section, settings)
  }
  await ensurePublicRead(
    token,
    SECTIONS.map((s) => s.collection),
  )
  for (const field of HIDE_FROM_SETTINGS) {
    await hideField(token, 'site_settings', field)
  }
  console.log('Done. Section headings moved; run directus:split-contacts for Контакты/Запись.')
}

main().catch((e) => {
  console.error(e.message)
  if (e.detail) console.error(JSON.stringify(e.detail, null, 2))
  process.exit(1)
})
