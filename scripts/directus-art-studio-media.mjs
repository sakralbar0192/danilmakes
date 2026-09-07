#!/usr/bin/env node
/**
 * Add Directus file-image fields, public read on files, upload & link existing assets.
 *
 * On VPS:
 *   cd /opt/danilmakes && set -a && source .env && set +a
 *   DIRECTUS_URL=http://127.0.0.1:8055 \
 *   ART_STUDIO_ASSETS=/opt/danilmakes/public/artStudio \
 *   node scripts/directus-art-studio-media.mjs
 */
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname, join, basename } from 'node:path'
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
const ASSETS_ROOT =
  process.env.ART_STUDIO_ASSETS || resolve(ROOT, 'public/artStudio')

if (!EMAIL || !PASSWORD) {
  console.error('Need DIRECTUS_ADMIN_EMAIL and DIRECTUS_ADMIN_PASSWORD')
  process.exit(1)
}

async function api(token, method, path, body, { formData } = {}) {
  const headers = { Authorization: `Bearer ${token}` }
  let payload
  if (formData) {
    payload = formData
  } else if (body !== undefined) {
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

async function login() {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(`login failed: ${JSON.stringify(json)}`)
  return json.data.access_token
}

async function fieldExists(token, collection, field) {
  const list = await api(token, 'GET', `/fields/${collection}`)
  return (list.data || []).some((f) => f.field === field)
}

async function ensureFileField(token, collection, field, note) {
  if (await fieldExists(token, collection, field)) {
    console.log(`  skip field ${collection}.${field}`)
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
        note: note || 'Загрузите изображение',
      },
    })
    console.log(`  created field ${collection}.${field}`)
  }
  await ensureFileRelation(token, collection, field)
}

async function ensureFileRelation(token, collection, field) {
  try {
    await api(token, 'GET', `/relations/${collection}/${field}`)
    console.log(`  skip relation ${collection}.${field}`)
    return
  } catch {
    // create
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

async function hideField(token, collection, field, note) {
  if (!(await fieldExists(token, collection, field))) return
  try {
    await api(token, 'PATCH', `/fields/${collection}/${field}`, {
      meta: {
        hidden: true,
        note: note || 'Устарело: используйте поле с загрузкой файла',
      },
    })
    console.log(`  hid ${collection}.${field}`)
  } catch (e) {
    console.warn(`  hide ${collection}.${field} skipped`, e.detail || e.message)
  }
}

async function ensurePublicFilesRead(token) {
  const policies = await api(token, 'GET', '/policies?limit=-1')
  const pub = (policies.data || []).find(
    (p) => p.name === '$t:public_label' || p.name === 'Public',
  )
  if (!pub) throw new Error('Public policy not found')
  const existing = await api(
    token,
    'GET',
    `/permissions?filter[policy][_eq]=${pub.id}&filter[collection][_eq]=directus_files&limit=-1`,
  )
  const hasRead = (existing.data || []).some((p) => p.action === 'read')
  if (hasRead) {
    console.log('  skip public directus_files read')
    return
  }
  await api(token, 'POST', '/permissions', {
    policy: pub.id,
    collection: 'directus_files',
    action: 'read',
    fields: ['*'],
  })
  console.log('  granted public read on directus_files')
}

const uploaded = new Map() // absPath -> file id

async function uploadLocal(token, relPath) {
  const clean = String(relPath || '').replace(/^\.\.\//, '').replace(/^\//, '')
  if (!clean) return null
  const abs = join(ASSETS_ROOT, clean)
  if (uploaded.has(abs)) return uploaded.get(abs)
  if (!existsSync(abs)) {
    console.warn(`  missing file ${abs}`)
    return null
  }
  const buf = readFileSync(abs)
  const fd = new FormData()
  const blob = new Blob([buf], { type: 'image/jpeg' })
  fd.append('file', blob, basename(abs))
  const json = await api(token, 'POST', '/files', undefined, { formData: fd })
  const id = json.data.id
  uploaded.set(abs, id)
  console.log(`  uploaded ${clean} → ${id}`)
  return id
}

async function linkTeacher(token) {
  const cur = await api(token, 'GET', '/items/teacher?fields=id,photo,photo_path')
  const row = cur.data
  if (!row) return
  if (row.photo) {
    console.log('  teacher.photo already set')
    return
  }
  const id = await uploadLocal(token, row.photo_path || 'assets/studio/class-06.jpg')
  if (!id) return
  await api(token, 'PATCH', '/items/teacher', { photo: id })
  console.log('  linked teacher.photo')
}

async function linkSchedule(token) {
  const cur = await api(token, 'GET', '/items/schedule_groups?fields=*&limit=-1')
  for (const row of cur.data || []) {
    const patch = {}
    if (!row.photo_1 && row.photo_1_path) {
      patch.photo_1 = await uploadLocal(token, row.photo_1_path)
    }
    if (!row.photo_2 && row.photo_2_path) {
      patch.photo_2 = await uploadLocal(token, row.photo_2_path)
    }
    const clean = Object.fromEntries(Object.entries(patch).filter(([, v]) => v))
    if (!Object.keys(clean).length) continue
    await api(token, 'PATCH', `/items/schedule_groups/${row.id}`, clean)
    console.log(`  linked schedule_groups/${row.id}`)
  }
}

async function linkGallery(token) {
  const cur = await api(token, 'GET', '/items/gallery_items?fields=*&limit=-1')
  for (const row of cur.data || []) {
    if (row.image) continue
    const id = await uploadLocal(token, row.image_path)
    if (!id) continue
    await api(token, 'PATCH', `/items/gallery_items/${row.id}`, { image: id })
    console.log(`  linked gallery_items/${row.id}`)
  }
}

async function main() {
  console.log(`Media migrate → ${BASE}`)
  console.log(`Assets root → ${ASSETS_ROOT}`)
  const token = await login()

  await ensureFileField(token, 'teacher', 'photo', 'Фото педагога (загрузка)')
  await ensureFileField(token, 'schedule_groups', 'photo_1', 'Фото 1')
  await ensureFileField(token, 'schedule_groups', 'photo_2', 'Фото 2')
  await ensureFileField(token, 'gallery_items', 'image', 'Изображение работы / кадра')

  await hideField(token, 'teacher', 'photo_path')
  await hideField(token, 'schedule_groups', 'photo_1_path')
  await hideField(token, 'schedule_groups', 'photo_2_path')
  await hideField(token, 'gallery_items', 'image_path')

  await ensurePublicFilesRead(token)

  await linkTeacher(token)
  await linkSchedule(token)
  await linkGallery(token)

  console.log('Done. Client can upload via Admin → Files / image fields.')
}

main().catch((e) => {
  console.error(e.message)
  if (e.detail) console.error(JSON.stringify(e.detail, null, 2))
  process.exit(1)
})
