#!/usr/bin/env node
/**
 * Flatten schedule_groups → schedule_section.groups (JSON)
 * and prices → pricing.items (JSON), then delete child collections.
 *
 *   DIRECTUS_URL=http://127.0.0.1:8055 npm run directus:flatten-sections
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

async function fieldsOf(token, collection) {
  const list = await api(token, 'GET', `/fields/${collection}`)
  return new Map((list.data || []).map((f) => [f.field, f]))
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

function fileId(fileOrId) {
  if (!fileOrId) return null
  if (typeof fileOrId === 'object') return fileOrId.id || null
  return fileOrId
}

async function deleteField(token, collection, field) {
  const map = await fieldsOf(token, collection)
  if (!map.has(field)) return
  try {
    await api(token, 'DELETE', `/fields/${collection}/${field}`)
    console.log(`  deleted field ${collection}.${field}`)
  } catch (e) {
    console.warn(`  skip delete field ${collection}.${field}`, e.detail || e.message)
  }
}

async function deleteRelation(token, collection, field) {
  try {
    await api(token, 'DELETE', `/relations/${collection}/${field}`)
    console.log(`  deleted relation ${collection}.${field}`)
  } catch {
    // none
  }
}

async function ensureJsonListField(token, collection, field, meta) {
  const map = await fieldsOf(token, collection)
  if (map.has(field)) {
    const existing = map.get(field)
    // If leftover O2M alias — remove and recreate as JSON
    if (existing.type === 'alias' || existing.meta?.special?.includes?.('o2m')) {
      await deleteField(token, collection, field)
    } else {
      await api(token, 'PATCH', `/fields/${collection}/${field}`, {
        meta: {
          interface: 'list',
          options: meta.options,
          note: meta.note || null,
          special: ['cast-json'],
        },
      })
      console.log(`  updated ${collection}.${field}`)
      return
    }
  }
  await api(token, 'POST', `/fields/${collection}`, {
    field,
    type: 'json',
    schema: {},
    meta: {
      interface: 'list',
      special: ['cast-json'],
      options: meta.options,
      note: meta.note || null,
      width: 'full',
    },
  })
  console.log(`  created ${collection}.${field}`)
}

async function collectionExists(token, collection) {
  const list = await api(token, 'GET', '/collections')
  return (list.data || []).some((c) => c.collection === collection)
}

async function deleteCollection(token, collection) {
  if (!(await collectionExists(token, collection))) {
    console.log(`  skip delete missing ${collection}`)
    return
  }
  await api(token, 'DELETE', `/collections/${collection}`)
  console.log(`  deleted collection ${collection}`)
}

const GROUP_LIST_OPTIONS = {
  template: '{{eyebrow}} · {{title}}',
  fields: [
    { field: 'eyebrow', name: 'Подзаголовок', type: 'string', meta: { interface: 'input', width: 'half' } },
    { field: 'title', name: 'Возраст / название', type: 'string', meta: { interface: 'input', width: 'half', required: true } },
    { field: 'description', name: 'Описание', type: 'text', meta: { interface: 'input-multiline' } },
    {
      field: 'slots',
      name: 'Слоты',
      type: 'json',
      meta: {
        interface: 'list',
        options: {
          template: '{{days}} {{time}}',
          fields: [
            { field: 'days', name: 'Дни', type: 'string', meta: { interface: 'input', width: 'half' } },
            { field: 'time', name: 'Время', type: 'string', meta: { interface: 'input', width: 'half' } },
          ],
        },
      },
    },
    { field: 'photo_1', name: 'Фото 1', type: 'uuid', meta: { interface: 'file-image', width: 'half' } },
    { field: 'photo_1_alt', name: 'Alt фото 1', type: 'string', meta: { interface: 'input', width: 'half' } },
    { field: 'photo_2', name: 'Фото 2', type: 'uuid', meta: { interface: 'file-image', width: 'half' } },
    { field: 'photo_2_alt', name: 'Alt фото 2', type: 'string', meta: { interface: 'input', width: 'half' } },
    { field: 'photo_1_path', name: 'Fallback path 1', type: 'string', meta: { interface: 'input', hidden: true } },
    { field: 'photo_2_path', name: 'Fallback path 2', type: 'string', meta: { interface: 'input', hidden: true } },
  ],
}

const PRICE_LIST_OPTIONS = {
  template: '{{title}} — {{price}}',
  fields: [
    { field: 'title', name: 'Название', type: 'string', meta: { interface: 'input', width: 'half', required: true } },
    { field: 'price', name: 'Цена', type: 'string', meta: { interface: 'input', width: 'half', required: true } },
    { field: 'eyebrow', name: 'Подзаголовок', type: 'string', meta: { interface: 'input', width: 'half' } },
    {
      field: 'is_featured',
      name: 'Пробное / акцент',
      type: 'boolean',
      meta: { interface: 'boolean', width: 'half' },
    },
    { field: 'description', name: 'Описание', type: 'text', meta: { interface: 'input-multiline' } },
  ],
}

async function main() {
  console.log(`Flatten sections → ${BASE}`)
  const token = await loginToken()

  // —— Read current child data (if collections still exist) ——
  let groupsRaw = []
  let pricesRaw = []
  if (await collectionExists(token, 'schedule_groups')) {
    groupsRaw =
      (
        await api(
          token,
          'GET',
          '/items/schedule_groups?fields=*,photo_1.id,photo_2.id&sort=sort&limit=-1',
        )
      ).data || []
  }
  if (await collectionExists(token, 'prices')) {
    pricesRaw = (await api(token, 'GET', '/items/prices?sort=sort&limit=-1')).data || []
  }

  const schedule = (await api(token, 'GET', '/items/schedule_section')).data || {}
  const pricing = (await api(token, 'GET', '/items/pricing')).data || {}

  // Tear down O2M wiring first
  await deleteRelation(token, 'schedule_groups', 'schedule_section_id')
  await deleteRelation(token, 'prices', 'pricing_id')
  await deleteField(token, 'schedule_section', 'groups')
  await deleteField(token, 'pricing', 'items')

  await ensureJsonListField(token, 'schedule_section', 'groups', {
    note: 'Группы по возрастам',
    options: GROUP_LIST_OPTIONS,
  })
  await ensureJsonListField(token, 'pricing', 'items', {
    note: 'Тарифы',
    options: PRICE_LIST_OPTIONS,
  })

  const existingGroups = parseMaybeJson(schedule.groups, [])
  const groups =
    Array.isArray(existingGroups) && existingGroups.length
      ? existingGroups
      : groupsRaw.map((g) => ({
          eyebrow: g.eyebrow || '',
          title: g.title || '',
          description: g.description || '',
          slots: parseMaybeJson(g.slots, []),
          photo_1: fileId(g.photo_1),
          photo_2: fileId(g.photo_2),
          photo_1_alt: g.photo_1_alt || '',
          photo_2_alt: g.photo_2_alt || '',
          photo_1_path: g.photo_1_path || '',
          photo_2_path: g.photo_2_path || '',
        }))

  const existingItems = parseMaybeJson(pricing.items, [])
  const items =
    Array.isArray(existingItems) && existingItems.length
      ? existingItems
      : pricesRaw.map((p) => ({
          title: p.title || '',
          price: p.price || '',
          eyebrow: p.eyebrow || '',
          description: p.description || '',
          is_featured: Boolean(p.is_featured),
        }))

  await api(token, 'PATCH', '/items/schedule_section', { groups })
  console.log(`  migrated ${groups.length} groups → schedule_section.groups`)
  await api(token, 'PATCH', '/items/pricing', { items })
  console.log(`  migrated ${items.length} items → pricing.items`)

  await deleteCollection(token, 'schedule_groups')
  await deleteCollection(token, 'prices')

  try {
    await api(token, 'POST', '/utils/cache/clear', {})
  } catch {
    // optional
  }

  console.log('Done. Collections schedule_groups and prices removed.')
}

main().catch((e) => {
  console.error(e.message)
  if (e.detail) console.error(JSON.stringify(e.detail, null, 2))
  process.exit(1)
})
