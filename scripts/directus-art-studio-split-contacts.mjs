#!/usr/bin/env node
/**
 * Create contacts singleton; move contact fields out of site_settings.
 * Clarify trial collection label as «Запись».
 *
 *   DIRECTUS_URL=http://127.0.0.1:8055 npm run directus:split-contacts
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

const CONTACT_FIELDS = [
  { field: 'heading', type: 'string', note: 'Заголовок блока контактов' },
  { field: 'phone', type: 'string', note: 'Как на сайте: +7 (933) 322-38-03' },
  { field: 'vk_url', type: 'string' },
  { field: 'vk_label', type: 'string' },
  { field: 'address', type: 'string' },
  { field: 'address_note', type: 'string' },
  { field: 'hours', type: 'string' },
  { field: 'hours_note', type: 'string' },
  { field: 'has_reviews', type: 'boolean', note: 'Показать виджет отзывов Яндекса' },
  { field: 'yandex_reviews_url', type: 'string' },
]

const FROM_SETTINGS = {
  heading: 'contact_heading',
  phone: 'phone',
  vk_url: 'vk_url',
  vk_label: 'vk_label',
  address: 'address',
  address_note: 'address_note',
  hours: 'hours',
  hours_note: 'hours_note',
  has_reviews: 'has_reviews',
  yandex_reviews_url: 'yandex_reviews_url',
}

const HIDE = Object.values(FROM_SETTINGS)

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

async function ensureCollection(token, collection, meta) {
  const list = await api(token, 'GET', '/collections')
  if ((list.data || []).some((c) => c.collection === collection)) {
    await api(token, 'PATCH', `/collections/${collection}`, { meta })
    console.log(`  updated meta ${collection}`)
    return
  }
  await api(token, 'POST', '/collections', {
    collection,
    meta,
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
  console.log(`  created ${collection}`)
}

async function ensureField(token, collection, spec) {
  const map = await fieldsOf(token, collection)
  if (map.has(spec.field)) {
    console.log(`  skip ${collection}.${spec.field}`)
    return
  }
  const type = spec.type || 'string'
  await api(token, 'POST', `/fields/${collection}`, {
    field: spec.field,
    type,
    schema: type === 'boolean' ? { default_value: false } : {},
    meta: {
      interface: type === 'boolean' ? 'boolean' : type === 'text' ? 'input-multiline' : 'input',
      width: 'full',
      note: spec.note || null,
    },
  })
  console.log(`  created ${collection}.${spec.field}`)
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
    if (have.has(`${collection}:read`)) {
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
      note: 'Устарело: перенесено в коллекцию Contacts',
    },
  })
  console.log(`  hid ${collection}.${field}`)
}

async function main() {
  console.log(`Split contacts → ${BASE}`)
  const token = await loginToken()

  await ensureCollection(token, 'contacts', {
    icon: 'place',
    singleton: true,
    note: 'Блок «Контакты» на главной',
    translations: [
      {
        language: 'ru-RU',
        translation: 'Контакты',
        singular: 'Контакты',
        plural: 'Контакты',
      },
    ],
  })

  await ensureCollection(token, 'trial', {
    icon: 'edit_calendar',
    singleton: true,
    note: 'Блок «Запись» на главной',
    translations: [
      {
        language: 'ru-RU',
        translation: 'Запись',
        singular: 'Запись',
        plural: 'Запись',
      },
    ],
  })

  for (const spec of CONTACT_FIELDS) {
    await ensureField(token, 'contacts', spec)
  }

  const settings = (await api(token, 'GET', '/items/site_settings')).data || {}
  const cur = (await api(token, 'GET', '/items/contacts')).data || {}
  const patch = {}
  for (const [dest, src] of Object.entries(FROM_SETTINGS)) {
    const val = cur[dest] ?? settings[src]
    if (val !== undefined && val !== null && val !== '') patch[dest] = val
  }
  // boolean: keep 0/false
  if (cur.has_reviews == null && settings.has_reviews != null) {
    patch.has_reviews = settings.has_reviews
  }
  await api(token, 'PATCH', '/items/contacts', patch)
  console.log('  migrated contacts', patch)

  await ensurePublicRead(token, ['contacts', 'trial'])

  for (const field of HIDE) {
    await hideField(token, 'site_settings', field)
  }

  await api(token, 'PATCH', '/collections/site_settings', {
    meta: {
      icon: 'branding_watermark',
      singleton: true,
      note: 'Бренд: логотип',
      translations: [
        {
          language: 'ru-RU',
          translation: 'Бренд',
          singular: 'Бренд',
          plural: 'Бренд',
        },
      ],
    },
  })
  console.log('  site_settings → brand/logo only')
  console.log('Done.')
}

main().catch((e) => {
  console.error(e.message)
  if (e.detail) console.error(JSON.stringify(e.detail, null, 2))
  process.exit(1)
})
