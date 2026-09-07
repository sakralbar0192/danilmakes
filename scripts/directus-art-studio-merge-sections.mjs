#!/usr/bin/env node
/**
 * Merge section headings + content into one admin block each:
 *   schedule_section (+ nested schedule_groups) → «Расписание»
 *   pricing (+ nested prices) → «Цены»
 *   works (+ nested gallery rail via show_in_rail stays in gallery_items;
 *           works keeps titles; gallery_items stays «Галерея»)
 *
 * Child list collections are hidden from the sidebar and edited inside the parent.
 *
 *   DIRECTUS_URL=http://127.0.0.1:8055 npm run directus:merge-sections
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

async function ensureFkField(token, collection, field) {
  const map = await fieldsOf(token, collection)
  if (map.has(field)) {
    console.log(`  skip ${collection}.${field}`)
    return
  }
  await api(token, 'POST', `/fields/${collection}`, {
    field,
    type: 'integer',
    schema: {},
    meta: { interface: 'select-dropdown-m2o', hidden: true, width: 'half' },
  })
  console.log(`  created ${collection}.${field}`)
}

async function ensureO2MAlias(token, collection, field, opts = {}) {
  const map = await fieldsOf(token, collection)
  if (map.has(field)) {
    await api(token, 'PATCH', `/fields/${collection}/${field}`, {
      meta: {
        interface: 'list-o2m',
        special: ['o2m'],
        options: {
          template: opts.template || '{{title}}',
          enableCreate: true,
          enableSelect: true,
        },
        note: opts.note || null,
      },
    })
    console.log(`  updated alias ${collection}.${field}`)
    return
  }
  await api(token, 'POST', `/fields/${collection}`, {
    field,
    type: 'alias',
    meta: {
      interface: 'list-o2m',
      special: ['o2m'],
      options: {
        template: opts.template || '{{title}}',
        enableCreate: true,
        enableSelect: true,
      },
      note: opts.note || null,
    },
  })
  console.log(`  created alias ${collection}.${field}`)
}

async function ensureO2MRelation(token, {
  manyCollection,
  manyField,
  oneCollection,
  oneField,
  sortField,
}) {
  try {
    await api(token, 'GET', `/relations/${manyCollection}/${manyField}`)
    await api(token, 'PATCH', `/relations/${manyCollection}/${manyField}`, {
      meta: {
        one_collection: oneCollection,
        one_field: oneField,
        sort_field: sortField || null,
        one_deselect_action: 'nullify',
      },
    })
    console.log(`  updated relation ${manyCollection}.${manyField} → ${oneCollection}.${oneField}`)
    return
  } catch {
    // create
  }
  await api(token, 'POST', '/relations', {
    collection: manyCollection,
    field: manyField,
    related_collection: oneCollection,
    meta: {
      one_field: oneField,
      sort_field: sortField || null,
      one_deselect_action: 'nullify',
    },
    schema: { on_delete: 'SET NULL' },
  })
  console.log(`  created relation ${manyCollection}.${manyField} → ${oneCollection}.${oneField}`)
}

async function attachAllToSingleton(token, manyCollection, fkField, oneId) {
  const list = await api(token, 'GET', `/items/${manyCollection}?fields=id,${fkField}&limit=-1`)
  const rows = list.data || []
  let n = 0
  for (const row of rows) {
    if (row[fkField] === oneId) continue
    await api(token, 'PATCH', `/items/${manyCollection}/${row.id}`, { [fkField]: oneId })
    n++
  }
  console.log(`  linked ${n}/${rows.length} ${manyCollection} → ${oneId}`)
}

async function hideCollection(token, collection, group) {
  await api(token, 'PATCH', `/collections/${collection}`, {
    meta: {
      hidden: true,
      group: group || null,
      accountability: 'all',
    },
  })
  console.log(`  hid nav ${collection}${group ? ` (group=${group})` : ''}`)
}

async function labelCollection(token, collection, meta) {
  await api(token, 'PATCH', `/collections/${collection}`, { meta })
  console.log(`  labeled ${collection} → ${meta.translations?.[0]?.translation || collection}`)
}

async function main() {
  console.log(`Merge sections → ${BASE}`)
  const token = await loginToken()

  // —— Расписание ——
  const schedule = (await api(token, 'GET', '/items/schedule_section')).data
  if (!schedule?.id) throw new Error('schedule_section singleton missing')

  await ensureFkField(token, 'schedule_groups', 'schedule_section_id')
  await ensureO2MAlias(token, 'schedule_section', 'groups', {
    template: '{{title}}',
    note: 'Группы по возрастам',
  })
  await ensureO2MRelation(token, {
    manyCollection: 'schedule_groups',
    manyField: 'schedule_section_id',
    oneCollection: 'schedule_section',
    oneField: 'groups',
    sortField: 'sort',
  })
  await attachAllToSingleton(token, 'schedule_groups', 'schedule_section_id', schedule.id)
  await hideCollection(token, 'schedule_groups', 'schedule_section')
  await labelCollection(token, 'schedule_section', {
    icon: 'calendar_month',
    singleton: true,
    hidden: false,
    note: 'Блок «Расписание»: заголовки и группы',
    translations: [
      {
        language: 'ru-RU',
        translation: 'Расписание',
        singular: 'Расписание',
        plural: 'Расписание',
      },
    ],
  })

  // —— Цены ——
  const pricing = (await api(token, 'GET', '/items/pricing')).data
  if (!pricing?.id) throw new Error('pricing singleton missing')

  await ensureFkField(token, 'prices', 'pricing_id')
  await ensureO2MAlias(token, 'pricing', 'items', {
    template: '{{title}} — {{price}}',
    note: 'Тарифы',
  })
  await ensureO2MRelation(token, {
    manyCollection: 'prices',
    manyField: 'pricing_id',
    oneCollection: 'pricing',
    oneField: 'items',
    sortField: 'sort',
  })
  await attachAllToSingleton(token, 'prices', 'pricing_id', pricing.id)
  await hideCollection(token, 'prices', 'pricing')
  await labelCollection(token, 'pricing', {
    icon: 'payments',
    singleton: true,
    hidden: false,
    note: 'Блок «Цены»: заголовки и тарифы',
    translations: [
      {
        language: 'ru-RU',
        translation: 'Цены',
        singular: 'Цены',
        plural: 'Цены',
      },
    ],
  })

  // —— Работы: заголовки + выбор работ ленты через галерею (show_in_rail) ——
  // Галерея остаётся отдельным блоком (страница /gallery). Подписываем works.
  await labelCollection(token, 'works', {
    icon: 'photo_library',
    singleton: true,
    hidden: false,
    note: 'Заголовки ленты на главной. Фото — в «Галерея» (флаг show_in_rail)',
    translations: [
      {
        language: 'ru-RU',
        translation: 'Работы',
        singular: 'Работы',
        plural: 'Работы',
      },
    ],
  })
  await labelCollection(token, 'gallery_items', {
    icon: 'collections',
    hidden: false,
    note: 'Галерея и лента на главной (show_in_rail)',
    translations: [
      {
        language: 'ru-RU',
        translation: 'Галерея',
        singular: 'Работа',
        plural: 'Галерея',
      },
    ],
  })

  console.log('Done. Open Расписание / Цены — группы и тарифы внутри формы.')
}

main().catch((e) => {
  console.error(e.message)
  if (e.detail) console.error(JSON.stringify(e.detail, null, 2))
  process.exit(1)
})
