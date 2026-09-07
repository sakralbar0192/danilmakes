#!/usr/bin/env node
/**
 * Merge teacher into atmosphere → CMS block «Студия».
 *
 *   DIRECTUS_URL=http://127.0.0.1:8055 npm run directus:merge-studio
 */
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname, basename } from 'node:path'
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

async function api(token, method, path, body, { formData } = {}) {
  const headers = { Accept: 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  let payload = body
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

async function loginToken() {
  return (await api(null, 'POST', '/auth/login', { email: EMAIL, password: PASSWORD })).data
    .access_token
}

async function fieldsOf(token, collection) {
  const list = await api(token, 'GET', `/fields/${collection}`)
  return new Map((list.data || []).map((f) => [f.field, f]))
}

async function ensureStringField(token, collection, field, meta = {}) {
  const map = await fieldsOf(token, collection)
  if (map.has(field)) {
    await api(token, 'PATCH', `/fields/${collection}/${field}`, {
      meta: { ...meta, interface: meta.interface || (meta.type === 'text' ? 'input-multiline' : 'input') },
    })
    console.log(`  updated ${collection}.${field}`)
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
      translations: meta.translations || null,
      hidden: meta.hidden || false,
    },
  })
  console.log(`  created ${collection}.${field}`)
}

async function ensureFileField(token, collection, field, note) {
  const map = await fieldsOf(token, collection)
  if (map.has(field)) {
    await api(token, 'PATCH', `/fields/${collection}/${field}`, {
      meta: {
        interface: 'file-image',
        special: ['file'],
        display: 'image',
        note,
        translations: [{ language: 'ru-RU', translation: 'Фото педагога' }],
      },
    })
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
        translations: [{ language: 'ru-RU', translation: 'Фото педагога' }],
      },
    })
    console.log(`  created ${collection}.${field}`)
  }
  try {
    await api(token, 'GET', `/relations/${collection}/${field}`)
  } catch {
    await api(token, 'POST', '/relations', {
      collection,
      field,
      related_collection: 'directus_files',
      meta: { one_deselect_action: 'nullify' },
      schema: { on_delete: 'SET NULL' },
    })
    console.log(`  relation ${collection}.${field}`)
  }
}

async function uploadLocal(token, relativePath) {
  const candidates = [
    resolve(ROOT, 'public/artStudio', relativePath),
    resolve(ROOT, '../art-studio/examples', relativePath),
    resolve(ROOT, '../art-studio', relativePath),
  ]
  const abs = candidates.find((p) => existsSync(p))
  if (!abs) {
    console.warn(`  skip upload missing ${relativePath}`)
    return null
  }
  const buf = readFileSync(abs)
  const ext = basename(abs).split('.').pop()?.toLowerCase()
  const type = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg'
  const fd = new FormData()
  fd.append('file', new Blob([buf], { type }), basename(abs))
  const json = await api(token, 'POST', '/files', undefined, { formData: fd })
  console.log(`  uploaded ${relativePath} → ${json.data.id}`)
  return json.data.id
}

async function main() {
  console.log(`Merge studio ← teacher → ${BASE}`)
  const token = await loginToken()

  let teacher = null
  try {
    teacher = (await api(token, 'GET', '/items/teacher?fields=*,photo.id')).data
  } catch {
    console.log('  teacher already gone')
  }

  await ensureStringField(token, 'atmosphere', 'teacher_name', {
    note: 'ФИО педагога',
    translations: [{ language: 'ru-RU', translation: 'Имя педагога' }],
  })
  await ensureStringField(token, 'atmosphere', 'teacher_bio', {
    type: 'text',
    note: 'Текст о педагоге',
    translations: [{ language: 'ru-RU', translation: 'О педагоге' }],
  })
  await ensureFileField(token, 'atmosphere', 'teacher_photo', 'Портрет педагога · 4:5 · ~800×1000')
  await ensureStringField(token, 'atmosphere', 'teacher_photo_alt', {
    note: 'Alt портрета',
    translations: [{ language: 'ru-RU', translation: 'Alt фото педагога' }],
  })
  await ensureStringField(token, 'atmosphere', 'teacher_photo_path', {
    hidden: true,
    note: 'Fallback path',
  })

  const atmosphere = (await api(token, 'GET', '/items/atmosphere')).data || {}
  const patch = {
    eyebrow: atmosphere.eyebrow || 'Студия',
  }
  if (teacher) {
    patch.teacher_name = teacher.name || atmosphere.teacher_name
    patch.teacher_bio = teacher.bio || atmosphere.teacher_bio
    patch.teacher_photo_alt = teacher.photo_alt || atmosphere.teacher_photo_alt
    patch.teacher_photo_path = teacher.photo_path || atmosphere.teacher_photo_path
    const photoId = teacher.photo?.id || teacher.photo || atmosphere.teacher_photo
    if (photoId) {
      patch.teacher_photo = photoId
    } else if (teacher.photo_path) {
      const uploaded = await uploadLocal(token, teacher.photo_path)
      if (uploaded) patch.teacher_photo = uploaded
    }
  }
  if (!patch.teacher_name) {
    patch.teacher_name = 'Жукова Алёна Александровна'
    patch.teacher_bio =
      'Ведёт занятия в студии «Мама, я рисую»: учит видеть цвет и форму, держать кисть и не бояться «неправильного» штриха. Работает с малышами от трёх лет и со взрослыми — в небольшом темпе группы, с вниманием к каждому.'
    patch.teacher_photo_alt = 'Педагог Жукова Алёна Александровна в студии'
    patch.teacher_photo_path = 'assets/studio/teacher-exhibition.jpg'
    if (!atmosphere.teacher_photo) {
      const uploaded = await uploadLocal(token, 'assets/studio/teacher-exhibition.jpg')
      if (uploaded) patch.teacher_photo = uploaded
    }
  }

  // Prefer «Студия» as section eyebrow
  if (atmosphere.eyebrow === 'Атмосфера' || !atmosphere.eyebrow) patch.eyebrow = 'Студия'

  await api(token, 'PATCH', '/items/atmosphere', patch)
  console.log('  migrated teacher fields into atmosphere')

  await api(token, 'PATCH', '/collections/atmosphere', {
    meta: {
      icon: 'cottage',
      singleton: true,
      note: 'Атмосфера студии и педагог',
      translations: [
        { language: 'ru-RU', translation: 'Студия', singular: 'Студия', plural: 'Студия' },
      ],
    },
  })
  console.log('  labeled atmosphere → Студия')

  // field labels for section copy
  for (const [field, tr] of [
    ['eyebrow', 'Подзаголовок'],
    ['title', 'Заголовок'],
    ['lead', 'Текст'],
    ['photo_main', 'Фото студии (большое)'],
    ['photo_side', 'Фото студии (боковое)'],
  ]) {
    try {
      await api(token, 'PATCH', `/fields/atmosphere/${field}`, {
        meta: { translations: [{ language: 'ru-RU', translation: tr }] },
      })
    } catch {
      // optional
    }
  }

  try {
    await api(token, 'DELETE', '/collections/teacher')
    console.log('  deleted teacher')
  } catch (e) {
    console.warn('  skip delete teacher', e.message)
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
