#!/usr/bin/env node
/**
 * Extend CMS: hero/atmosphere/brand/directions + image size notes + seed uploads.
 *
 *   DIRECTUS_URL=http://127.0.0.1:8055 \
 *   ART_STUDIO_ASSETS=/opt/danilmakes/public/artStudio \
 *   node scripts/directus-art-studio-content-extend.mjs
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

const NOTES = {
  logo: 'Логотип в шапке. Рекомендация: 512×512 px (квадрат), JPEG/PNG/WebP, до 200 КБ.',
  hero_title_image:
    'PNG-заголовок «мама, я рисую!» на hero. Рекомендация: ~1200×480 px, PNG с прозрачностью, до 300 КБ.',
  hero_image_1:
    'Hero фото слева. Соотношение 4:5. Рекомендация: 800×1000 px, JPEG, до 350 КБ.',
  hero_image_2:
    'Hero фото по центру. Соотношение 1:1. Рекомендация: 800×800 px, JPEG, до 300 КБ.',
  hero_image_3:
    'Hero фото справа (работа). Соотношение 5:4. Рекомендация: 1000×800 px, JPEG, до 350 КБ.',
  photo_main:
    'Атмосфера — большое фото. Соотношение 3:4. Рекомендация: 900×1200 px, JPEG, до 400 КБ.',
  photo_side:
    'Атмосфера — боковое фото. Соотношение ~4:5. Рекомендация: 800×1000 px, JPEG, до 350 КБ.',
  teacher_photo:
    'Фото педагога. Соотношение 4:5 (портрет). Рекомендация: 800×1000 px, JPEG, до 400 КБ.',
  schedule_photo:
    'Мини-фото у группы. Квадрат 1:1. Рекомендация: 600×600 px, JPEG, до 200 КБ.',
  gallery_image:
    'Работа / кадр галереи. Рекомендация: длинная сторона 1200–1600 px, JPEG, до 450 КБ. Вертикаль предпочтительна.',
}

if (!EMAIL || !PASSWORD) {
  console.error('Need DIRECTUS_ADMIN_EMAIL and DIRECTUS_ADMIN_PASSWORD')
  process.exit(1)
}

async function api(token, method, path, body, { formData } = {}) {
  const headers = { Authorization: `Bearer ${token}` }
  let payload
  if (formData) payload = formData
  else if (body !== undefined) {
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

async function fieldsOf(token, collection) {
  const list = await api(token, 'GET', `/fields/${collection}`)
  return new Map((list.data || []).map((f) => [f.field, f]))
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
      special: meta.special,
    },
  })
  console.log(`  created ${collection}.${field}`)
}

async function ensureCollection(token, spec) {
  const list = await api(token, 'GET', '/collections')
  if ((list.data || []).some((c) => c.collection === spec.collection)) {
    console.log(`  skip collection ${spec.collection}`)
    return
  }
  await api(token, 'POST', '/collections', spec)
  console.log(`  created collection ${spec.collection}`)
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
    if (have.has(key)) continue
    await api(token, 'POST', '/permissions', {
      policy: pub.id,
      collection,
      action: 'read',
      fields: ['*'],
    })
    console.log(`  public read ${collection}`)
  }
}

const uploaded = new Map()

async function uploadLocal(token, relPath) {
  const clean = String(relPath || '').replace(/^\.\.\//, '').replace(/^\//, '')
  if (!clean) return null
  const abs = join(ASSETS_ROOT, clean)
  if (uploaded.has(abs)) return uploaded.get(abs)
  if (!existsSync(abs)) {
    console.warn(`  missing ${abs}`)
    return null
  }
  const buf = readFileSync(abs)
  const fd = new FormData()
  const ext = basename(abs).split('.').pop()?.toLowerCase()
  const type =
    ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg'
  fd.append('file', new Blob([buf], { type }), basename(abs))
  const json = await api(token, 'POST', '/files', undefined, { formData: fd })
  uploaded.set(abs, json.data.id)
  console.log(`  upload ${clean}`)
  return json.data.id
}

async function patchNotesExisting(token) {
  await ensureFileField(token, 'teacher', 'photo', NOTES.teacher_photo)
  await ensureFileField(token, 'gallery_items', 'image', NOTES.gallery_image)
}

async function extendSiteSettings(token) {
  const files = [['logo', NOTES.logo]]
  for (const [field, note] of files) {
    await ensureFileField(token, 'site_settings', field, note)
  }
  // Section headings live in schedule_section / pricing / works / trial
}

async function ensureHero(token) {
  await ensureCollection(token, {
    collection: 'hero',
    meta: {
      icon: 'wallpaper',
      singleton: true,
      note: 'Первый экран главной',
      translations: [
        { language: 'ru-RU', translation: 'Hero', singular: 'Hero', plural: 'Hero' },
      ],
    },
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
  await ensureFileField(token, 'hero', 'title_image', NOTES.hero_title_image)
  await ensureFileField(token, 'hero', 'image_1', NOTES.hero_image_1)
  await ensureFileField(token, 'hero', 'image_2', NOTES.hero_image_2)
  await ensureFileField(token, 'hero', 'image_3', NOTES.hero_image_3)
}

async function ensureAtmosphere(token) {
  await ensureCollection(token, {
    collection: 'atmosphere',
    meta: {
      icon: 'photo_camera',
      singleton: true,
      note: 'Блок атмосферы на главной',
      translations: [
        { language: 'ru-RU', translation: 'Атмосфера', singular: 'Атмосфера', plural: 'Атмосфера' },
      ],
    },
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
  await ensureFileField(token, 'atmosphere', 'photo_main', NOTES.photo_main)
  await ensureFileField(token, 'atmosphere', 'photo_side', NOTES.photo_side)
  await ensureStringField(token, 'atmosphere', 'photo_main_alt', {})
  await ensureStringField(token, 'atmosphere', 'photo_side_alt', {})
  await ensureStringField(token, 'atmosphere', 'eyebrow', {})
  await ensureStringField(token, 'atmosphere', 'title', {})
  await ensureStringField(token, 'atmosphere', 'lead', { type: 'text' })
  await ensureStringField(token, 'atmosphere', 'benefits', {
    type: 'json',
    interface: 'list',
    special: ['cast-json'],
    note: 'Список преимуществ (короткие строки)',
  })
  await ensureStringField(token, 'atmosphere', 'steps', {
    type: 'json',
    interface: 'input-code',
    note: 'JSON: [{"title":"…","text":"…"}, …]',
  })
}

async function ensureDirections(token) {
  await ensureCollection(token, {
    collection: 'directions',
    meta: {
      icon: 'category',
      sort_field: 'sort',
      display_template: '{{label}}',
      note: 'Чипы направлений',
      translations: [
        { language: 'ru-RU', translation: 'Направления', singular: 'Направление', plural: 'Направления' },
      ],
    },
    schema: {},
    fields: [
      {
        field: 'id',
        type: 'integer',
        meta: { hidden: true },
        schema: { is_primary_key: true, has_auto_increment: true },
      },
      {
        field: 'status',
        type: 'string',
        meta: {
          interface: 'select-dropdown',
          options: {
            choices: [
              { text: 'Published', value: 'published' },
              { text: 'Draft', value: 'draft' },
            ],
          },
          width: 'half',
        },
        schema: { default_value: 'published' },
      },
      {
        field: 'kind',
        type: 'string',
        meta: {
          interface: 'select-dropdown',
          width: 'half',
          options: {
            choices: [
              { text: 'Чип направления', value: 'chip' },
              { text: 'Аудитория', value: 'audience' },
            ],
          },
        },
        schema: { default_value: 'chip' },
      },
      {
        field: 'label',
        type: 'string',
        meta: { interface: 'input', required: true },
        schema: { is_nullable: false },
      },
      {
        field: 'description',
        type: 'text',
        meta: { interface: 'input-multiline', note: 'Для аудитории' },
        schema: {},
      },
      {
        field: 'style_key',
        type: 'string',
        meta: {
          interface: 'select-dropdown',
          note: 'Только для чипов',
          options: {
            choices: [
              { text: 'paint', value: 'paint' },
              { text: 'graphic', value: 'graphic' },
              { text: 'draw', value: 'draw' },
              { text: 'design', value: 'design' },
              { text: 'sculpt', value: 'sculpt' },
            ],
          },
        },
        schema: {},
      },
      {
        field: 'sort',
        type: 'integer',
        meta: { interface: 'input', width: 'half' },
        schema: { default_value: 0 },
      },
    ],
  })
}

async function seedContent(token) {
  const logo = await uploadLocal(token, 'assets/brand/logo.jpg')
  const titleImg = await uploadLocal(token, 'assets/brand/hero.png')
  const h1 = await uploadLocal(token, 'assets/studio/class-girl-yellow.jpg')
  const h2 = await uploadLocal(token, 'assets/studio/class-cake-duo.jpg')
  const h3 = await uploadLocal(token, 'assets/works/work-carrots.jpg')

  await api(token, 'PATCH', '/items/site_settings', {
    logo,
  })
  console.log('  seeded site_settings logo')

  await api(token, 'PATCH', '/items/works', {
    eyebrow: 'Галерея',
    title: 'Работы учеников',
  }).catch(() => console.warn('  skip works seed (run directus:split-sections)'))
  await api(token, 'PATCH', '/items/schedule_section', {
    eyebrow: 'Расписание',
    title: 'Группы по возрастам',
    lead: 'К каждой группе — примеры работ этого возраста. Актуально на август 2026 — свободные места уточняйте при записи.',
  }).catch(() => console.warn('  skip schedule_section seed'))
  await api(token, 'PATCH', '/items/pricing', {
    eyebrow: 'Стоимость',
    title: 'Прозрачные цены',
  }).catch(() => console.warn('  skip pricing seed'))
  await api(token, 'PATCH', '/items/trial', {
    eyebrow: 'Запись',
    title: 'Бесплатное пробное занятие',
    lead: 'Оставьте телефон — перезвоним, подскажем ближайшую группу и что взять с собой.',
  }).catch(() => console.warn('  skip trial seed'))
  console.log('  seeded section singletons (if present)')

  await api(token, 'PATCH', '/items/hero', {
    eyebrow: 'Красноярск · Стасовой 48Е · ежедневно 9:00–21:00',
    lead:
      'Детская творческая студия, где рисовать можно с трёх лет. Небольшие группы, тёплая атмосфера и первое занятие бесплатно.',
    title_image: titleImg,
    image_1: h1,
    image_2: h2,
    image_3: h3,
  })
  console.log('  seeded hero')

  const amMain = await uploadLocal(token, 'assets/studio/class-04.jpg')
  const amSide = await uploadLocal(token, 'assets/studio/class-easel-dog.jpg')
  await api(token, 'PATCH', '/items/atmosphere', {
    photo_main: amMain,
    photo_side: amSide,
    photo_main_alt: 'Дети рисуют в студии',
    photo_side_alt: 'Малыш у мольберта',
    eyebrow: 'Атмосфера',
    title: 'Уютное пространство, где хочется возвращаться',
    lead: 'Материалы уже ждут на столе. Педагог рядом — поддерживает, показывает приём и даёт ребёнку сделать работу самому.',
    benefits: [
      'Все материалы предоставляем — краски, кисти, бумага',
      'Развиваем воображение, моторику и уверенность',
      'Индивидуальный подход в небольшой группе',
      'Тёплая атмосфера и поддержка педагога',
    ],
    steps: [
      { title: 'Приходите на пробное', text: 'Бесплатно знакомимся со студией и педагогом.' },
      { title: 'Рисуете в группе', text: 'Небольшие группы — внимание каждому.' },
      { title: 'Забираете работу домой', text: 'Видимый результат уже после первого занятия.' },
    ],
  })
  console.log('  seeded atmosphere')

  const dirs = await api(token, 'GET', '/items/directions?limit=1')
  if (!(dirs.data || []).length) {
    const rows = [
      { status: 'published', kind: 'chip', label: 'Живопись', style_key: 'paint', sort: 1 },
      { status: 'published', kind: 'chip', label: 'Графика', style_key: 'graphic', sort: 2 },
      { status: 'published', kind: 'chip', label: 'Рисунок', style_key: 'draw', sort: 3 },
      { status: 'published', kind: 'chip', label: 'Дизайн', style_key: 'design', sort: 4 },
      { status: 'published', kind: 'chip', label: 'Лепка', style_key: 'sculpt', sort: 5 },
      {
        status: 'published',
        kind: 'audience',
        label: 'Малыши 3–5',
        description: 'Короткие занятия, игра с цветом и формой, первые удачные работы домой.',
        sort: 10,
      },
      {
        status: 'published',
        kind: 'audience',
        label: 'Дети 6–11',
        description: 'Гуашь, акварель, графика. Учимся видеть свет, тень и строить сюжет.',
        sort: 11,
      },
      {
        status: 'published',
        kind: 'audience',
        label: 'Подростки и взрослые',
        description: 'Мастер-классы и регулярные занятия — от открытки до серьёзной техники.',
        sort: 12,
      },
    ]
    for (const row of rows) {
      await api(token, 'POST', '/items/directions', row)
    }
    console.log('  seeded directions')
  } else {
    console.log('  skip directions seed')
  }
}

async function main() {
  console.log(`Content extend → ${BASE}`)
  const token = await login()
  await patchNotesExisting(token)
  await extendSiteSettings(token)
  await ensureHero(token)
  await ensureAtmosphere(token)
  await ensureDirections(token)
  await ensurePublicRead(token, ['hero', 'atmosphere', 'directions', 'directus_files'])
  await seedContent(token)
  console.log('Done.')
}

main().catch((e) => {
  console.error(e.message)
  if (e.detail) console.error(JSON.stringify(e.detail, null, 2))
  process.exit(1)
})
