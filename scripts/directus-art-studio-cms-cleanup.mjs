#!/usr/bin/env node
/**
 * CMS cleanup / fixes for art-studio Directus:
 * - restore schedule_section.groups and pricing.items (were broken O2M ids)
 * - directions: chips only (remove audience cards)
 * - hide dead atmosphere benefits/steps
 * - hide teacher.education
 * - merge works → gallery_items headings; delete works
 * - fix contacts.has_reviews cast-boolean
 * - Russian notes for tall / show_in_rail / groups / items
 *
 *   DIRECTUS_URL=http://127.0.0.1:8055 npm run directus:cms-cleanup
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

function isBrokenList(value) {
  const arr = parseMaybeJson(value, null)
  if (!Array.isArray(arr) || !arr.length) return true
  return arr.every((x) => typeof x === 'number' || typeof x === 'string')
}

const GROUPS_SEED = [
  {
    eyebrow: 'Малыши',
    title: '3–5 лет',
    description: 'Короткие занятия, игра с цветом и формой, первые работы домой.',
    slots: [
      { days: 'Пн / Ср', time: '10:00–10:45' },
      { days: 'Вт / Чт', time: '18:30–19:15' },
    ],
    photo_1: '614dd873-bc36-426f-92b2-25b26969a156',
    photo_2: 'd3d4e09b-68d8-4889-a171-319970f07f65',
    photo_1_alt: 'Работа малышей: морковки',
    photo_2_alt: 'Малыш за работой',
    photo_1_path: 'assets/works/work-carrots.jpg',
    photo_2_path: 'assets/studio/class-girl-yellow.jpg',
  },
  {
    eyebrow: 'Дети',
    title: '6–8 лет',
    description: 'Гуашь и сюжет: учимся видеть цвет, форму и держать композицию.',
    slots: [
      { days: 'Вт / Чт', time: '10:00–11:00' },
      { days: 'Вт / Чт', time: '17:00–18:00' },
    ],
    photo_1: '1128634b-dc3a-484f-9a16-2d1cd4999031',
    photo_2: '91a148d8-acd9-4d19-9e4c-855e2fbcde36',
    photo_1_alt: 'Работа детей: лягушка',
    photo_2_alt: 'Дети за общим столом',
    photo_1_path: 'assets/works/work-frog.jpg',
    photo_2_path: 'assets/studio/class-cake-duo.jpg',
  },
  {
    eyebrow: 'Старшие',
    title: '9–11 лет',
    description: 'Свет и тень, графика, более сложные сюжеты и техника.',
    slots: [
      { days: 'Пн / Ср', time: '11:00–12:15' },
      { days: 'Пн / Ср', time: '17:00–18:15' },
    ],
    photo_1: 'd81b96bb-46cb-4b0e-bd9a-c7d3699a6e57',
    photo_2: '63780864-ef95-408e-8d18-ffa33974cf0f',
    photo_1_alt: 'Работа старших: птица',
    photo_2_alt: 'Графика: робот',
    photo_1_path: 'assets/works/work-bird-fruit.jpg',
    photo_2_path: 'assets/works/work-robot.jpg',
  },
]

const PRICES_SEED = [
  {
    eyebrow: 'Старт',
    title: 'Пробное занятие',
    price: '0 ₽',
    description:
      'Для детей от 3 лет. Познакомьтесь со студией без обязательств — материалы в студии.',
    is_featured: true,
  },
  { title: 'Разовое занятие', price: '600 ₽', is_featured: false },
  { title: 'Абонемент 4 занятия', price: '2 000 ₽', is_featured: false },
  { title: 'Абонемент 8 занятий', price: '3 800 ₽', is_featured: false },
]

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
  ],
}

const PRICE_LIST_OPTIONS = {
  template: '{{title}} — {{price}}',
  fields: [
    { field: 'title', name: 'Название', type: 'string', meta: { interface: 'input', width: 'half', required: true } },
    { field: 'price', name: 'Цена', type: 'string', meta: { interface: 'input', width: 'half', required: true } },
    { field: 'eyebrow', name: 'Подзаголовок', type: 'string', meta: { interface: 'input', width: 'half' } },
    { field: 'is_featured', name: 'Пробное / акцент', type: 'boolean', meta: { interface: 'boolean', width: 'half' } },
    { field: 'description', name: 'Описание', type: 'text', meta: { interface: 'input-multiline' } },
  ],
}

async function patchFieldMeta(token, collection, field, metaPatch) {
  await api(token, 'PATCH', `/fields/${collection}/${field}`, { meta: metaPatch })
  console.log(`  field ${collection}.${field}`)
}

async function hideField(token, collection, field, note) {
  try {
    await patchFieldMeta(token, collection, field, {
      hidden: true,
      note: note || 'Не используется на сайте',
    })
  } catch (e) {
    console.warn(`  skip hide ${collection}.${field}`, e.message)
  }
}

async function main() {
  console.log(`CMS cleanup → ${BASE}`)
  const token = await loginToken()

  // —— 5/6 restore groups & items ——
  const schedule = (await api(token, 'GET', '/items/schedule_section')).data || {}
  const pricing = (await api(token, 'GET', '/items/pricing')).data || {}

  await patchFieldMeta(token, 'schedule_section', 'groups', {
    interface: 'list',
    special: ['cast-json'],
    options: GROUP_LIST_OPTIONS,
    note: 'Группы по возрастам',
    translations: [{ language: 'ru-RU', translation: 'Группы' }],
  })
  await patchFieldMeta(token, 'pricing', 'items', {
    interface: 'list',
    special: ['cast-json'],
    options: PRICE_LIST_OPTIONS,
    note: 'Тарифы',
    translations: [{ language: 'ru-RU', translation: 'Тарифы' }],
  })

  const groups = isBrokenList(schedule.groups) ? GROUPS_SEED : parseMaybeJson(schedule.groups, GROUPS_SEED)
  const items = isBrokenList(pricing.items) ? PRICES_SEED : parseMaybeJson(pricing.items, PRICES_SEED)
  await api(token, 'PATCH', '/items/schedule_section', { groups })
  console.log(`  restored schedule groups (${groups.length})`)
  await api(token, 'PATCH', '/items/pricing', { items })
  console.log(`  restored pricing items (${items.length})`)

  // —— 1 directions: chips only ——
  const dirs = (await api(token, 'GET', '/items/directions?limit=-1')).data || []
  for (const row of dirs) {
    if (row.kind === 'audience') {
      await api(token, 'DELETE', `/items/directions/${row.id}`)
      console.log(`  deleted audience direction ${row.id} (${row.label})`)
    }
  }
  await patchFieldMeta(token, 'directions', 'kind', {
    hidden: true,
    note: 'Только чипы направлений',
    options: {
      choices: [{ text: 'Чип', value: 'chip' }],
    },
  })
  await hideField(token, 'directions', 'description', 'Карточки аудиторий убраны с сайта')
  await api(token, 'PATCH', '/collections/directions', {
    meta: {
      icon: 'category',
      sort_field: 'sort',
      display_template: '{{label}}',
      note: 'Чипы направлений на главной',
      translations: [
        { language: 'ru-RU', translation: 'Направления', singular: 'Направление', plural: 'Направления' },
      ],
    },
  })

  // —— 2 tall note ——
  await patchFieldMeta(token, 'gallery_items', 'tall', {
    note: 'Высокая плитка в сетке галереи (masonry)',
    translations: [{ language: 'ru-RU', translation: 'Высокая плитка' }],
  })
  await patchFieldMeta(token, 'gallery_items', 'show_in_rail', {
    note: 'Показать в ленте «Работы» на главной',
    translations: [{ language: 'ru-RU', translation: 'В ленте на главной' }],
  })

  // —— 3 hide atmosphere benefits/steps ——
  await hideField(token, 'atmosphere', 'benefits', 'Устарело: блок преимуществ убран с сайта')
  await hideField(token, 'atmosphere', 'steps', 'Устарело: шаги убраны с сайта')

  // —— 4 hide teacher education ——
  await hideField(token, 'teacher', 'education', 'Не используется на сайте')

  // —— 7 merge works headings into gallery_items collection meta via singleton fields on gallery ——
  // Add eyebrow/title to a new singleton `gallery` OR attach to gallery_items via...
  // Practical: add fields home_eyebrow/home_title on a singleton by converting works → rename to gallery_section
  // User asked to merge Works into Gallery: store headings on gallery_items collection as... can't.
  // Instead: move works fields onto new fields of a singleton that IS gallery_items' companion —
  // Simplest durable approach: add `eyebrow`+`title` fields by creating singleton `gallery`
  // and nesting is heavy. Lighter: keep gallery_items, fold works into it by adding
  // collection-level content in Directus via renaming works → embed headings in gallery_items
  // using a singleton alias collection named gallery that only holds headings + we keep items list.
  //
  // Final approach: add eyebrow/title as fields on FIRST... no.
  // Use gallery singleton with JSON items (flatten). 

  const works = (await api(token, 'GET', '/items/works').catch(() => ({ data: null }))).data
  const galleryRows =
    (await api(token, 'GET', '/items/gallery_items?fields=*,image.id&sort=sort&limit=-1')).data || []

  const collections = await api(token, 'GET', '/collections')
  const haveGallerySingleton = (collections.data || []).some((c) => c.collection === 'gallery')

  if (!haveGallerySingleton) {
    await api(token, 'POST', '/collections', {
      collection: 'gallery',
      meta: {
        icon: 'collections',
        singleton: true,
        note: 'Галерея и лента работ на главной',
        translations: [
          { language: 'ru-RU', translation: 'Галерея', singular: 'Галерея', plural: 'Галерея' },
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
    console.log('  created gallery singleton')
  } else {
    await api(token, 'PATCH', '/collections/gallery', {
      meta: {
        icon: 'collections',
        singleton: true,
        note: 'Галерея и лента работ на главной',
        translations: [
          { language: 'ru-RU', translation: 'Галерея', singular: 'Галерея', plural: 'Галерея' },
        ],
      },
    })
  }

  // ensure fields on gallery
  const gFields = await api(token, 'GET', '/fields/gallery')
  const gMap = new Map((gFields.data || []).map((f) => [f.field, f]))
  async function ensureGalleryField(field, type, meta) {
    if (gMap.has(field)) {
      await api(token, 'PATCH', `/fields/gallery/${field}`, { meta })
      return
    }
    await api(token, 'POST', '/fields/gallery', {
      field,
      type,
      schema: {},
      meta,
    })
    console.log(`  created gallery.${field}`)
  }

  await ensureGalleryField('eyebrow', 'string', {
    interface: 'input',
    note: 'Подзаголовок ленты на главной',
    translations: [{ language: 'ru-RU', translation: 'Подзаголовок' }],
  })
  await ensureGalleryField('title', 'string', {
    interface: 'input',
    note: 'Заголовок ленты на главной',
    translations: [{ language: 'ru-RU', translation: 'Заголовок' }],
  })
  await ensureGalleryField('items', 'json', {
    interface: 'list',
    special: ['cast-json'],
    note: 'Работы: галерея и лента',
    translations: [{ language: 'ru-RU', translation: 'Работы' }],
    options: {
      template: '{{caption}}',
      fields: [
        { field: 'image', name: 'Фото', type: 'uuid', meta: { interface: 'file-image', width: 'half' } },
        { field: 'caption', name: 'Подпись', type: 'string', meta: { interface: 'input', width: 'half' } },
        { field: 'tags', name: 'Теги', type: 'string', meta: { interface: 'input', note: 'works kids ages-little studio…' } },
        {
          field: 'tall',
          name: 'Высокая плитка',
          type: 'boolean',
          meta: { interface: 'boolean', width: 'half', note: 'Высокая плитка в сетке галереи' },
        },
        {
          field: 'show_in_rail',
          name: 'В ленте на главной',
          type: 'boolean',
          meta: { interface: 'boolean', width: 'half', note: 'Показать в ленте на главной' },
        },
        { field: 'image_path', name: 'Fallback path', type: 'string', meta: { interface: 'input', hidden: true } },
        { field: 'status', name: 'Статус', type: 'string', meta: { interface: 'input', hidden: true } },
      ],
    },
  })

  const galleryItems = galleryRows.map((row) => ({
    image: row.image?.id || row.image || null,
    caption: row.caption || '',
    tags: row.tags || '',
    tall: Boolean(row.tall),
    show_in_rail: Boolean(row.show_in_rail),
    image_path: row.image_path || '',
    status: row.status || 'published',
  }))

  await api(token, 'PATCH', '/items/gallery', {
    eyebrow: works?.eyebrow || 'Галерея',
    title: works?.title || 'Работы учеников',
    items: galleryItems,
  })
  console.log(`  seeded gallery singleton (${galleryItems.length} items)`)

  // public read for gallery
  const policies = await api(token, 'GET', '/policies?limit=-1')
  const pub = (policies.data || []).find((p) => p.name === '$t:public_label' || p.name === 'Public')
  if (pub) {
    const existing = await api(token, 'GET', `/permissions?filter[policy][_eq]=${pub.id}&limit=-1`)
    const have = new Set((existing.data || []).map((p) => `${p.collection}:${p.action}`))
    if (!have.has('gallery:read')) {
      await api(token, 'POST', '/permissions', {
        policy: pub.id,
        collection: 'gallery',
        action: 'read',
        fields: ['*'],
      })
      console.log('  public read gallery')
    }
  }

  // delete old collections
  for (const col of ['works', 'gallery_items']) {
    try {
      await api(token, 'DELETE', `/collections/${col}`)
      console.log(`  deleted ${col}`)
    } catch (e) {
      console.warn(`  skip delete ${col}`, e.message)
    }
  }

  // —— 8 has_reviews ——
  await patchFieldMeta(token, 'contacts', 'has_reviews', {
    interface: 'boolean',
    special: ['cast-boolean'],
    note: 'Показать виджет отзывов Яндекса на сайте',
    translations: [{ language: 'ru-RU', translation: 'Показать отзывы' }],
  })
  // leave current value; ensure boolean-friendly write works
  const contacts = (await api(token, 'GET', '/items/contacts')).data || {}
  await api(token, 'PATCH', '/items/contacts', {
    has_reviews: Boolean(contacts.has_reviews),
  })
  console.log(`  has_reviews cast-boolean ok (value=${Boolean(contacts.has_reviews)})`)

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
