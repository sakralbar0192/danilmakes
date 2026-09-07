#!/usr/bin/env node
/**
 * Bootstrap Directus collections + seed for «Мама, я рисую».
 *
 * Run on VPS (Directus must be reachable):
 *   cd /opt/danilmakes && set -a && source .env && set +a
 *   DIRECTUS_URL=http://127.0.0.1:8055 node scripts/directus-art-studio-setup.mjs
 *
 * Or via docker network without publishing a port:
 *   docker compose -f docker-compose.prod.yml run --rm --no-deps \
 *     -v "$PWD/scripts:/scripts:ro" \
 *     -e DIRECTUS_URL=http://directus:8055 \
 *     -e DIRECTUS_ADMIN_EMAIL -e DIRECTUS_ADMIN_PASSWORD \
 *     curlimages/curl …  (prefer node below)
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
const PUBLIC_POLICY = process.env.DIRECTUS_PUBLIC_POLICY_ID || ''

if (!EMAIL || !PASSWORD) {
  console.error('Need DIRECTUS_ADMIN_EMAIL and DIRECTUS_ADMIN_PASSWORD')
  process.exit(1)
}

async function api(token, method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
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

async function ensureCollection(token, spec) {
  const list = await api(token, 'GET', '/collections')
  const exists = (list.data || []).some((c) => c.collection === spec.collection)
  if (exists) {
    console.log(`  skip collection ${spec.collection}`)
    return
  }
  await api(token, 'POST', '/collections', spec)
  console.log(`  created collection ${spec.collection}`)
}

async function ensurePublicRead(token, policyId, collections) {
  const existing = await api(token, 'GET', `/permissions?filter[policy][_eq]=${policyId}&limit=-1`)
  const have = new Set((existing.data || []).map((p) => `${p.collection}:${p.action}`))
  for (const collection of collections) {
    const key = `${collection}:read`
    if (have.has(key)) {
      console.log(`  skip permission ${key}`)
      continue
    }
    await api(token, 'POST', '/permissions', {
      policy: policyId,
      collection,
      action: 'read',
      fields: ['*'],
    })
    console.log(`  granted public read on ${collection}`)
  }
}

async function resolvePublicPolicyId(token) {
  if (PUBLIC_POLICY) return PUBLIC_POLICY
  const policies = await api(token, 'GET', '/policies?limit=-1')
  const pub = (policies.data || []).find(
    (p) => p.name === '$t:public_label' || p.name === 'Public' || (!p.admin_access && !p.app_access && p.name?.includes('public')),
  )
  if (!pub) throw new Error('Public policy not found')
  return pub.id
}

const statusField = {
  field: 'status',
  type: 'string',
  meta: {
    width: 'half',
    interface: 'select-dropdown',
    options: {
      choices: [
        { text: 'Published', value: 'published' },
        { text: 'Draft', value: 'draft' },
      ],
    },
    display: 'labels',
    display_options: {
      choices: [
        { text: 'Published', value: 'published', foreground: '#fff', background: '#00C897' },
        { text: 'Draft', value: 'draft', foreground: '#18222F', background: '#D3DAE4' },
      ],
    },
  },
  schema: { default_value: 'published', is_nullable: false },
}

const idField = {
  field: 'id',
  type: 'integer',
  meta: { hidden: true },
  schema: { is_primary_key: true, has_auto_increment: true },
}

const COLLECTIONS = [
  {
    collection: 'site_settings',
    meta: {
      icon: 'branding_watermark',
      singleton: true,
      note: 'Бренд: логотип',
      translations: [
        { language: 'ru-RU', translation: 'Бренд', singular: 'Бренд', plural: 'Бренд' },
      ],
    },
    schema: {},
    fields: [idField],
  },
  {
    collection: 'contacts',
    meta: {
      icon: 'place',
      singleton: true,
      note: 'Блок «Контакты» на главной',
      translations: [
        { language: 'ru-RU', translation: 'Контакты', singular: 'Контакты', plural: 'Контакты' },
      ],
    },
    schema: {},
    fields: [
      idField,
      { field: 'heading', type: 'string', meta: { interface: 'input', note: 'Заголовок блока контактов' }, schema: {} },
      { field: 'phone', type: 'string', meta: { interface: 'input', width: 'half', note: 'Как на сайте: +7 (933) 322-38-03' }, schema: {} },
      { field: 'vk_url', type: 'string', meta: { interface: 'input', width: 'half' }, schema: {} },
      { field: 'vk_label', type: 'string', meta: { interface: 'input', width: 'half' }, schema: {} },
      { field: 'address', type: 'string', meta: { interface: 'input' }, schema: {} },
      { field: 'address_note', type: 'string', meta: { interface: 'input' }, schema: {} },
      { field: 'hours', type: 'string', meta: { interface: 'input' }, schema: {} },
      { field: 'hours_note', type: 'string', meta: { interface: 'input' }, schema: {} },
      { field: 'has_reviews', type: 'boolean', meta: { interface: 'boolean', note: 'Показать виджет отзывов Яндекса' }, schema: { default_value: false } },
      { field: 'yandex_reviews_url', type: 'string', meta: { interface: 'input' }, schema: {} },
    ],
  },
  {
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
      idField,
      { field: 'eyebrow', type: 'string', meta: { interface: 'input', width: 'full', note: 'Город · адрес · часы' }, schema: {} },
      { field: 'lead', type: 'text', meta: { interface: 'input-multiline' }, schema: {} },
    ],
  },
  {
    collection: 'works',
    meta: {
      icon: 'photo_library',
      singleton: true,
      note: 'Заголовки ленты на главной. Фото — в «Галерея» (флаг show_in_rail)',
      translations: [
        { language: 'ru-RU', translation: 'Работы', singular: 'Работы', plural: 'Работы' },
      ],
    },
    schema: {},
    fields: [
      idField,
      { field: 'eyebrow', type: 'string', meta: { interface: 'input' }, schema: {} },
      { field: 'title', type: 'string', meta: { interface: 'input' }, schema: {} },
    ],
  },
  {
    collection: 'schedule_section',
    meta: {
      icon: 'calendar_month',
      singleton: true,
      note: 'Блок «Расписание»: заголовки и группы',
      translations: [
        { language: 'ru-RU', translation: 'Расписание', singular: 'Расписание', plural: 'Расписание' },
      ],
    },
    schema: {},
    fields: [
      idField,
      { field: 'eyebrow', type: 'string', meta: { interface: 'input' }, schema: {} },
      { field: 'title', type: 'string', meta: { interface: 'input' }, schema: {} },
      { field: 'lead', type: 'text', meta: { interface: 'input-multiline' }, schema: {} },
      {
        field: 'groups',
        type: 'json',
        meta: {
          interface: 'list',
          special: ['cast-json'],
          note: 'Группы по возрастам',
          options: {
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
          },
        },
        schema: {},
      },
    ],
  },
  {
    collection: 'pricing',
    meta: {
      icon: 'payments',
      singleton: true,
      note: 'Блок «Цены»: заголовки и тарифы',
      translations: [
        { language: 'ru-RU', translation: 'Цены', singular: 'Цены', plural: 'Цены' },
      ],
    },
    schema: {},
    fields: [
      idField,
      { field: 'eyebrow', type: 'string', meta: { interface: 'input' }, schema: {} },
      { field: 'title', type: 'string', meta: { interface: 'input' }, schema: {} },
      {
        field: 'items',
        type: 'json',
        meta: {
          interface: 'list',
          special: ['cast-json'],
          note: 'Тарифы',
          options: {
            template: '{{title}} — {{price}}',
            fields: [
              { field: 'title', name: 'Название', type: 'string', meta: { interface: 'input', width: 'half', required: true } },
              { field: 'price', name: 'Цена', type: 'string', meta: { interface: 'input', width: 'half', required: true } },
              { field: 'eyebrow', name: 'Подзаголовок', type: 'string', meta: { interface: 'input', width: 'half' } },
              { field: 'is_featured', name: 'Пробное / акцент', type: 'boolean', meta: { interface: 'boolean', width: 'half' } },
              { field: 'description', name: 'Описание', type: 'text', meta: { interface: 'input-multiline' } },
            ],
          },
        },
        schema: {},
      },
    ],
  },
  {
    collection: 'trial',
    meta: {
      icon: 'edit_calendar',
      singleton: true,
      note: 'Блок «Запись» на главной',
      translations: [
        { language: 'ru-RU', translation: 'Запись', singular: 'Запись', plural: 'Запись' },
      ],
    },
    schema: {},
    fields: [
      idField,
      { field: 'eyebrow', type: 'string', meta: { interface: 'input' }, schema: {} },
      { field: 'title', type: 'string', meta: { interface: 'input' }, schema: {} },
      { field: 'lead', type: 'text', meta: { interface: 'input-multiline' }, schema: {} },
    ],
  },
  {
    collection: 'teacher',
    meta: {
      icon: 'school',
      singleton: true,
      note: 'Карточка педагога',
      translations: [
        { language: 'ru-RU', translation: 'Педагог', singular: 'Педагог', plural: 'Педагог' },
      ],
    },
    schema: {},
    fields: [
      idField,
      { field: 'name', type: 'string', meta: { interface: 'input', required: true }, schema: { is_nullable: false } },
      { field: 'bio', type: 'text', meta: { interface: 'input-multiline' }, schema: {} },
      { field: 'education', type: 'json', meta: { interface: 'list', options: { template: '{{}}' }, note: 'Список строк образования' }, schema: {} },
      { field: 'photo_path', type: 'string', meta: { interface: 'input', note: 'Относительно /artStudio/, напр. assets/studio/class-06.jpg' }, schema: {} },
      { field: 'photo_alt', type: 'string', meta: { interface: 'input' }, schema: {} },
    ],
  },
  {
    collection: 'gallery_items',
    meta: {
      icon: 'collections',
      sort_field: 'sort',
      display_template: '{{caption}}',
      note: 'Галерея и лента на главной (show_in_rail)',
      translations: [
        { language: 'ru-RU', translation: 'Галерея', singular: 'Работа', plural: 'Галерея' },
      ],
    },
    schema: {},
    fields: [
      idField,
      statusField,
      { field: 'image_path', type: 'string', meta: { interface: 'input', required: true, note: 'assets/works/….jpg' }, schema: { is_nullable: false } },
      { field: 'caption', type: 'string', meta: { interface: 'input' }, schema: {} },
      { field: 'tags', type: 'string', meta: { interface: 'input', note: 'Теги через пробел: works kids ages-little studio' }, schema: {} },
      { field: 'tall', type: 'boolean', meta: { interface: 'boolean', width: 'half' }, schema: { default_value: true } },
      { field: 'show_in_rail', type: 'boolean', meta: { interface: 'boolean', width: 'half', note: 'Показать в ленте на главной' }, schema: { default_value: false } },
      { field: 'sort', type: 'integer', meta: { interface: 'input', width: 'half' }, schema: { default_value: 0 } },
    ],
  },
]

const SEED = {
  site_settings: {},
  contacts: {
    heading: 'Ждём вас в студии',
    phone: '+7 (933) 322-38-03',
    vk_url: 'https://vk.ru/club238305506',
    vk_label: 'Мама, я рисую',
    address: 'г. Красноярск, ул. Елены Стасовой, 48Е',
    address_note: 'Вход со стороны леса',
    hours: 'ежедневно 9:00–21:00',
    hours_note: 'по предварительной записи',
    has_reviews: false,
    yandex_reviews_url: 'https://yandex.ru/maps/org/mama_ya_risuyu_/74376857158/reviews/',
  },
  hero: {
    eyebrow: 'Красноярск · Стасовой 48Е · ежедневно 9:00–21:00',
    lead:
      'Детская творческая студия, где рисовать можно с трёх лет. Небольшие группы, тёплая атмосфера и первое занятие бесплатно.',
  },
  works: {
    eyebrow: 'Галерея',
    title: 'Работы учеников',
  },
  schedule_section: {
    eyebrow: 'Расписание',
    title: 'Группы по возрастам',
    lead: 'К каждой группе — примеры работ этого возраста. Актуально на август 2026 — свободные места уточняйте при записи.',
    groups: [
      {
        eyebrow: 'Малыши',
        title: '3–5 лет',
        description: 'Короткие занятия, игра с цветом и формой, первые работы домой.',
        slots: [
          { days: 'Пн / Ср', time: '10:00–10:45' },
          { days: 'Вт / Чт', time: '18:30–19:15' },
        ],
        photo_1_path: 'assets/works/work-carrots.jpg',
        photo_1_alt: 'Работа малышей: морковки',
        photo_2_path: 'assets/studio/class-girl-yellow.jpg',
        photo_2_alt: 'Малыш за работой',
      },
      {
        eyebrow: 'Дети',
        title: '6–8 лет',
        description: 'Гуашь и сюжет: учимся видеть цвет, форму и держать композицию.',
        slots: [
          { days: 'Вт / Чт', time: '10:00–11:00' },
          { days: 'Вт / Чт', time: '17:00–18:00' },
        ],
        photo_1_path: 'assets/works/work-frog.jpg',
        photo_1_alt: 'Работа детей: лягушка',
        photo_2_path: 'assets/studio/class-cake-duo.jpg',
        photo_2_alt: 'Дети за общим столом',
      },
      {
        eyebrow: 'Старшие',
        title: '9–11 лет',
        description: 'Свет и тень, графика, более сложные сюжеты и техника.',
        slots: [
          { days: 'Пн / Ср', time: '11:00–12:15' },
          { days: 'Пн / Ср', time: '17:00–18:15' },
        ],
        photo_1_path: 'assets/works/work-bird-fruit.jpg',
        photo_1_alt: 'Работа старших: птица',
        photo_2_path: 'assets/works/work-robot.jpg',
        photo_2_alt: 'Графика: робот',
      },
    ],
  },
  pricing: {
    eyebrow: 'Стоимость',
    title: 'Прозрачные цены',
    items: [
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
    ],
  },
  trial: {
    eyebrow: 'Запись',
    title: 'Бесплатное пробное занятие',
    lead: 'Оставьте телефон — перезвоним, подскажем ближайшую группу и что взять с собой.',
  },
  teacher: {
    name: 'Жукова Алёна Александровна',
    bio: 'Педагог студии «Мама, я рисую». Помогает детям освоить цвет, форму и уверенный штрих — без страха «нарисовать неправильно».',
    education: ['Красноярское художественное училище им. В. И. Сурикова'],
    photo_path: 'assets/studio/class-06.jpg',
    photo_alt: 'Педагог Жукова Алёна Александровна с учениками в студии',
  },
  gallery_items: [
    { status: 'published', image_path: 'assets/works/work-carrots.jpg', caption: 'Огород · гуашь', tags: 'works kids ages-little', tall: true, show_in_rail: true, sort: 1 },
    { status: 'published', image_path: 'assets/works/work-flowers-can.jpg', caption: 'Цветы · гуашь', tags: 'works kids ages-little', tall: true, show_in_rail: true, sort: 2 },
    { status: 'published', image_path: 'assets/works/work-bird-fruit.jpg', caption: 'Зимняя птица', tags: 'works kids ages-older', tall: false, show_in_rail: true, sort: 3 },
    { status: 'published', image_path: 'assets/works/work-frog.jpg', caption: 'Лягушка · гуашь', tags: 'works kids ages-mid', tall: true, show_in_rail: true, sort: 4 },
    { status: 'published', image_path: 'assets/works/work-robot.jpg', caption: 'Робот · графика', tags: 'works kids ages-older', tall: true, show_in_rail: true, sort: 5 },
    { status: 'published', image_path: 'assets/works/vk-10.jpg', caption: 'Ёжик · гуашь', tags: 'works kids', tall: true, show_in_rail: true, sort: 6 },
    { status: 'published', image_path: 'assets/studio/class-easel-dog.jpg', caption: 'Занятие в студии', tags: 'studio kids ages-little', tall: true, show_in_rail: true, sort: 7 },
    { status: 'published', image_path: 'assets/studio/class-girl-yellow.jpg', caption: 'Занятие · 3–5', tags: 'studio kids ages-little', tall: true, show_in_rail: false, sort: 8 },
    { status: 'published', image_path: 'assets/studio/class-cake-duo.jpg', caption: 'Группа · 6–8', tags: 'studio kids ages-mid', tall: true, show_in_rail: false, sort: 9 },
    { status: 'published', image_path: 'assets/studio/class-04.jpg', caption: 'Занятие в студии', tags: 'studio kids', tall: true, show_in_rail: false, sort: 10 },
    { status: 'published', image_path: 'assets/studio/class-06.jpg', caption: 'Итог занятия', tags: 'studio kids', tall: true, show_in_rail: false, sort: 11 },
    { status: 'published', image_path: 'assets/works/vk-30.jpg', caption: 'Огород · гуашь на чёрном', tags: 'works kids', tall: true, show_in_rail: false, sort: 12 },
    { status: 'published', image_path: 'assets/works/vk-15.jpg', caption: 'Акварель · зайчик и цветы', tags: 'works adults', tall: true, show_in_rail: false, sort: 13 },
    { status: 'published', image_path: 'assets/studio/kids-lesson.jpg', caption: 'Занятие с педагогом', tags: 'studio kids', tall: true, show_in_rail: false, sort: 14 },
    { status: 'published', image_path: 'assets/studio/group-class.jpg', caption: 'Группа за общим столом', tags: 'studio kids', tall: true, show_in_rail: false, sort: 15 },
    { status: 'published', image_path: 'assets/studio/adult-workshop.jpg', caption: 'Мастер-класс · акварель', tags: 'studio adults', tall: true, show_in_rail: false, sort: 16 },
  ],
}

async function seedSingleton(token, collection, data) {
  // Singletons: always PATCH /items/<collection> (no /:id)
  await api(token, 'PATCH', `/items/${collection}`, data)
  console.log(`  upserted singleton ${collection}`)
}

async function seedList(token, collection, rows, { replace = false } = {}) {
  const cur = await api(token, 'GET', `/items/${collection}?limit=-1`)
  const existing = cur.data || []
  if (existing.length && !replace) {
    console.log(`  skip seed ${collection} (${existing.length} items)`)
    return
  }
  if (existing.length && replace) {
    for (const row of existing) {
      await api(token, 'DELETE', `/items/${collection}/${row.id}`)
    }
    console.log(`  cleared ${collection}`)
  }
  for (const row of rows) {
    await api(token, 'POST', `/items/${collection}`, row)
  }
  console.log(`  seeded ${collection} (${rows.length})`)
}

async function main() {
  console.log(`Directus setup → ${BASE}`)
  const token = await login()
  console.log('Logged in')

  // collections may already exist from earlier probe
  for (const spec of COLLECTIONS) {
    await ensureCollection(token, spec)
  }

  const policyId = await resolvePublicPolicyId(token)
  console.log('Public policy', policyId)
  await ensurePublicRead(token, policyId, [
    'site_settings',
    'contacts',
    'hero',
    'works',
    'schedule_section',
    'pricing',
    'trial',
    'teacher',
    'gallery_items',
  ])

  await seedSingleton(token, 'site_settings', SEED.site_settings)
  await seedSingleton(token, 'contacts', SEED.contacts)
  await seedSingleton(token, 'hero', SEED.hero)
  await seedSingleton(token, 'works', SEED.works)
  await seedSingleton(token, 'schedule_section', SEED.schedule_section)
  await seedSingleton(token, 'pricing', SEED.pricing)
  await seedSingleton(token, 'trial', SEED.trial)
  await seedSingleton(token, 'teacher', SEED.teacher)
  await seedList(token, 'gallery_items', SEED.gallery_items, { replace: true })

  try {
    await api(token, 'PATCH', '/settings', {
      project_name: 'Мама, я рисую',
      project_descriptor: 'Контент сайта студии',
      default_language: 'ru-RU',
    })
    console.log('Updated project settings')
  } catch (e) {
    console.warn('settings patch skipped', e.detail || e.message)
  }

  console.log('Done.')
}

main().catch((e) => {
  console.error(e.message)
  if (e.detail) console.error(JSON.stringify(e.detail, null, 2))
  process.exit(1)
})
