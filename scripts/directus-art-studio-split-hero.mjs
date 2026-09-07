#!/usr/bin/env node
/**
 * Split hero fields out of site_settings into singleton collection `hero`.
 *
 * Migrates existing values, grants public read, hides legacy fields on site_settings.
 *
 *   DIRECTUS_URL=http://127.0.0.1:8055 \
 *   DIRECTUS_ADMIN_EMAIL=… DIRECTUS_ADMIN_PASSWORD=… \
 *   node scripts/directus-art-studio-split-hero.mjs
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

const NOTES = {
  title_image:
    'PNG-заголовок «мама, я рисую!» на hero. Рекомендация: ~1200×480 px, PNG с прозрачностью, до 300 КБ.',
  image_1:
    'Hero фото слева. Соотношение 4:5. Рекомендация: 800×1000 px, JPEG, до 350 КБ.',
  image_2:
    'Hero фото по центру. Соотношение 1:1. Рекомендация: 800×800 px, JPEG, до 300 КБ.',
  image_3:
    'Hero фото справа (работа). Соотношение 5:4. Рекомендация: 1000×800 px, JPEG, до 350 КБ.',
}

const LEGACY_HERO_FIELDS = [
  'hero_eyebrow',
  'hero_lead',
  'hero_title_image',
  'hero_image_1',
  'hero_image_2',
  'hero_image_3',
]

async function api(token, method, path, body) {
  const headers = { Authorization: `Bearer ${token}`, Accept: 'application/json' }
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
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(`login failed: ${JSON.stringify(json)}`)
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
    return false
  }
  await api(token, 'POST', '/collections', spec)
  console.log(`  created collection ${spec.collection}`)
  return true
}

async function ensureFileField(token, collection, field, note) {
  const map = await fieldsOf(token, collection)
  if (map.has(field)) {
    await api(token, 'PATCH', `/fields/${collection}/${field}`, {
      meta: { note, interface: 'file-image', special: ['file'], display: 'image' },
    })
    console.log(`  note ${collection}.${field}`)
  } else {
    await api(token, 'POST', `/fields/${collection}`, {
      field,
      type: 'uuid',
      schema: {},
      meta: {
        interface: 'file-image',
        special: ['file'],
        display: 'image',
        width: 'half',
        note,
      },
    })
    console.log(`  created ${collection}.${field}`)
  }
  await ensureFileRelation(token, collection, field)
}

async function ensureFileRelation(token, collection, field) {
  try {
    await api(token, 'GET', `/relations/${collection}/${field}`)
    console.log(`  skip relation ${collection}.${field}`)
    return
  } catch {
    // create below
  }
  try {
    await api(token, 'POST', '/relations', {
      collection,
      field,
      related_collection: 'directus_files',
      meta: { one_deselect_action: 'nullify' },
      schema: { on_delete: 'SET NULL' },
    })
    console.log(`  created relation ${collection}.${field}`)
  } catch (e) {
    console.warn(`  relation ${collection}.${field} failed`, e.detail || e.message)
  }
}

async function ensureStringField(token, collection, field, meta = {}) {
  const map = await fieldsOf(token, collection)
  if (map.has(field)) {
    console.log(`  skip ${collection}.${field}`)
    return
  }
  await api(token, 'POST', `/fields/${collection}`, {
    field,
    type: meta.type || 'string',
    schema: {},
    meta: {
      interface: meta.interface || (meta.type === 'text' ? 'input-multiline' : 'input'),
      width: meta.width || 'full',
      note: meta.note || null,
    },
  })
  console.log(`  created ${collection}.${field}`)
}

async function hideField(token, collection, field) {
  const map = await fieldsOf(token, collection)
  if (!map.has(field)) return
  try {
    await api(token, 'PATCH', `/fields/${collection}/${field}`, {
      meta: {
        hidden: true,
        note: 'Устарело: перенесено в коллекцию Hero',
      },
    })
    console.log(`  hid ${collection}.${field}`)
  } catch (e) {
    console.warn(`  hide ${collection}.${field} skipped`, e.detail || e.message)
  }
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

function fileId(value) {
  if (!value) return null
  if (typeof value === 'string') return value
  if (typeof value === 'object' && value.id) return value.id
  return null
}

async function ensureHero(token) {
  await ensureCollection(token, {
    collection: 'hero',
    meta: { icon: 'wallpaper', singleton: true, note: 'Первый экран главной' },
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
  await ensureStringField(token, 'hero', 'eyebrow', {
    note: 'Строка над заголовком (город · адрес · часы)',
  })
  await ensureStringField(token, 'hero', 'lead', { type: 'text' })
  await ensureFileField(token, 'hero', 'title_image', NOTES.title_image)
  await ensureFileField(token, 'hero', 'image_1', NOTES.image_1)
  await ensureFileField(token, 'hero', 'image_2', NOTES.image_2)
  await ensureFileField(token, 'hero', 'image_3', NOTES.image_3)
}

async function migrateFromSiteSettings(token) {
  const settings = await api(token, 'GET', '/items/site_settings')
  const s = settings.data || {}
  const heroCur = await api(token, 'GET', '/items/hero')
  const h = heroCur.data || {}

  const patch = {
    eyebrow: h.eyebrow || s.hero_eyebrow || null,
    lead: h.lead || s.hero_lead || null,
    title_image: fileId(h.title_image) || fileId(s.hero_title_image),
    image_1: fileId(h.image_1) || fileId(s.hero_image_1),
    image_2: fileId(h.image_2) || fileId(s.hero_image_2),
    image_3: fileId(h.image_3) || fileId(s.hero_image_3),
  }

  await api(token, 'PATCH', '/items/hero', patch)
  console.log('  migrated hero from site_settings (keeping existing hero values if set)')
  console.log(
    '   ',
    JSON.stringify(
      {
        eyebrow: patch.eyebrow,
        lead: patch.lead ? `${String(patch.lead).slice(0, 48)}…` : null,
        title_image: patch.title_image,
        image_1: patch.image_1,
        image_2: patch.image_2,
        image_3: patch.image_3,
      },
      null,
      0,
    ),
  )
}

async function main() {
  console.log(`Split hero → ${BASE}`)
  const token = await loginToken()
  await ensureHero(token)
  await ensurePublicRead(token, ['hero'])
  await migrateFromSiteSettings(token)
  for (const field of LEGACY_HERO_FIELDS) {
    await hideField(token, 'site_settings', field)
  }
  console.log('Done. Edit Content → Hero in Directus admin.')
}

main().catch((e) => {
  console.error(e.message)
  if (e.detail) console.error(JSON.stringify(e.detail, null, 2))
  process.exit(1)
})
