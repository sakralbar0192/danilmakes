#!/usr/bin/env node
/**
 * Fix group photos: move schedule_section.groups from JSON list
 * (file-image broken there) to real O2M collection schedule_groups.
 *
 *   DIRECTUS_URL=http://127.0.0.1:8055 npm run directus:fix-group-photos
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

function fileId(v) {
  if (!v) return null
  if (typeof v === 'object') return v.id || null
  return v
}

async function collectionExists(token, collection) {
  const list = await api(token, 'GET', '/collections')
  return (list.data || []).some((c) => c.collection === collection)
}

async function fieldsOf(token, collection) {
  const list = await api(token, 'GET', `/fields/${collection}`)
  return new Map((list.data || []).map((f) => [f.field, f]))
}

async function ensureFileField(token, collection, field, note) {
  const map = await fieldsOf(token, collection)
  if (!map.has(field)) {
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
  } else {
    await api(token, 'PATCH', `/fields/${collection}/${field}`, {
      meta: {
        interface: 'file-image',
        special: ['file'],
        display: 'image',
        width: 'half',
        note,
        hidden: false,
      },
    })
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

async function main() {
  console.log(`Fix group photos → ${BASE}`)
  const token = await loginToken()

  const schedule = (await api(token, 'GET', '/items/schedule_section')).data || {}
  const scheduleId = schedule.id
  if (!scheduleId) throw new Error('schedule_section missing')

  // Snapshot JSON groups before replacing the field
  const jsonGroups = parseMaybeJson(schedule.groups, [])
  const usableJson = Array.isArray(jsonGroups)
    ? jsonGroups.filter((g) => g && typeof g === 'object' && !Array.isArray(g) && g.title)
    : []
  console.log(`  json groups snapshot: ${usableJson.length}`)

  // Create / reset schedule_groups collection
  if (!(await collectionExists(token, 'schedule_groups'))) {
    await api(token, 'POST', '/collections', {
      collection: 'schedule_groups',
      meta: {
        icon: 'groups',
        hidden: true,
        group: 'schedule_section',
        sort_field: 'sort',
        display_template: '{{eyebrow}} · {{title}}',
        note: 'Группы блока «Занятия» (редактируются внутри Занятия)',
        translations: [
          { language: 'ru-RU', translation: 'Группы', singular: 'Группа', plural: 'Группы' },
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
    console.log('  created schedule_groups')
  } else {
    await api(token, 'PATCH', '/collections/schedule_groups', {
      meta: {
        icon: 'groups',
        hidden: true,
        group: 'schedule_section',
        sort_field: 'sort',
        display_template: '{{eyebrow}} · {{title}}',
        note: 'Группы блока «Занятия» (редактируются внутри Занятия)',
        translations: [
          { language: 'ru-RU', translation: 'Группы', singular: 'Группа', plural: 'Группы' },
        ],
      },
    })
  }

  const gFields = await fieldsOf(token, 'schedule_groups')
  async function ensureString(field, meta = {}) {
    if (gFields.has(field)) return
    await api(token, 'POST', `/fields/schedule_groups`, {
      field,
      type: meta.type || 'string',
      schema: meta.type === 'integer' ? { default_value: 0 } : {},
      meta: {
        interface: meta.interface || (meta.type === 'text' ? 'input-multiline' : 'input'),
        width: meta.width || 'full',
        note: meta.note || null,
        hidden: meta.hidden || false,
        options: meta.options,
        special: meta.special,
      },
    })
    gFields.set(field, true)
    console.log(`  created schedule_groups.${field}`)
  }

  await ensureString('status', {
    interface: 'select-dropdown',
    width: 'half',
    options: {
      choices: [
        { text: 'Published', value: 'published' },
        { text: 'Draft', value: 'draft' },
      ],
    },
  })
  // set default status via patch if needed
  await ensureString('eyebrow', { width: 'half' })
  await ensureString('title', { width: 'half' })
  await ensureString('description', { type: 'text' })
  await ensureString('slots', {
    type: 'json',
    interface: 'list',
    special: ['cast-json'],
    options: {
      template: '{{days}} {{time}}',
      fields: [
        { field: 'days', name: 'Дни', type: 'string', meta: { interface: 'input', width: 'half' } },
        { field: 'time', name: 'Время', type: 'string', meta: { interface: 'input', width: 'half' } },
      ],
    },
  })
  await ensureString('photo_1_alt', { width: 'half' })
  await ensureString('photo_2_alt', { width: 'half' })
  await ensureString('photo_1_path', { hidden: true })
  await ensureString('photo_2_path', { hidden: true })
  await ensureString('sort', { type: 'integer', interface: 'input', width: 'half' })
  await ensureString('schedule_section_id', {
    type: 'integer',
    interface: 'select-dropdown-m2o',
    hidden: true,
    width: 'half',
  })
  await ensureFileField(token, 'schedule_groups', 'photo_1', 'Фото группы 1 · 1:1 · ~600×600')
  await ensureFileField(token, 'schedule_groups', 'photo_2', 'Фото группы 2 · 1:1 · ~600×600')

  // Remove JSON groups field from schedule_section if present
  const sFields = await fieldsOf(token, 'schedule_section')
  const groupsField = sFields.get('groups')
  if (groupsField && groupsField.type === 'json') {
    await api(token, 'DELETE', '/fields/schedule_section/groups')
    console.log('  deleted JSON schedule_section.groups')
  } else if (groupsField && groupsField.type === 'alias') {
    console.log('  groups already alias')
  }

  // Ensure O2M alias
  const sFields2 = await fieldsOf(token, 'schedule_section')
  if (!sFields2.has('groups')) {
    await api(token, 'POST', '/fields/schedule_section', {
      field: 'groups',
      type: 'alias',
      meta: {
        interface: 'list-o2m',
        special: ['o2m'],
        options: {
          template: '{{eyebrow}} · {{title}}',
          enableCreate: true,
          enableSelect: true,
        },
        note: 'Группы по возрастам (фото меняются здесь)',
        translations: [{ language: 'ru-RU', translation: 'Группы' }],
      },
    })
    console.log('  created alias schedule_section.groups')
  } else {
    await api(token, 'PATCH', '/fields/schedule_section/groups', {
      meta: {
        interface: 'list-o2m',
        special: ['o2m'],
        options: {
          template: '{{eyebrow}} · {{title}}',
          enableCreate: true,
          enableSelect: true,
        },
        note: 'Группы по возрастам (фото меняются здесь)',
        translations: [{ language: 'ru-RU', translation: 'Группы' }],
      },
    })
  }

  try {
    await api(token, 'GET', '/relations/schedule_groups/schedule_section_id')
    await api(token, 'PATCH', '/relations/schedule_groups/schedule_section_id', {
      meta: {
        one_field: 'groups',
        sort_field: 'sort',
        one_deselect_action: 'nullify',
      },
    })
  } catch {
    await api(token, 'POST', '/relations', {
      collection: 'schedule_groups',
      field: 'schedule_section_id',
      related_collection: 'schedule_section',
      meta: {
        one_field: 'groups',
        sort_field: 'sort',
        one_deselect_action: 'nullify',
      },
      schema: { on_delete: 'SET NULL' },
    })
    console.log('  created O2M relation')
  }

  // Seed/migrate rows if empty
  const existing = (await api(token, 'GET', '/items/schedule_groups?limit=-1')).data || []
  if (!existing.length && usableJson.length) {
    for (let i = 0; i < usableJson.length; i++) {
      const g = usableJson[i]
      await api(token, 'POST', '/items/schedule_groups', {
        status: 'published',
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
        sort: i + 1,
        schedule_section_id: scheduleId,
      })
    }
    console.log(`  migrated ${usableJson.length} groups → schedule_groups`)
  } else {
    for (const row of existing) {
      if (row.schedule_section_id !== scheduleId) {
        await api(token, 'PATCH', `/items/schedule_groups/${row.id}`, {
          schedule_section_id: scheduleId,
        })
      }
    }
    console.log(`  linked existing groups (${existing.length})`)
  }

  // Public read
  const policies = await api(token, 'GET', '/policies?limit=-1')
  const pub = (policies.data || []).find((p) => p.name === '$t:public_label' || p.name === 'Public')
  if (pub) {
    const perms = await api(token, 'GET', `/permissions?filter[policy][_eq]=${pub.id}&limit=-1`)
    const have = new Set((perms.data || []).map((p) => `${p.collection}:${p.action}`))
    if (!have.has('schedule_groups:read')) {
      await api(token, 'POST', '/permissions', {
        policy: pub.id,
        collection: 'schedule_groups',
        action: 'read',
        fields: ['*'],
      })
      console.log('  public read schedule_groups')
    }
  }

  try {
    await api(token, 'POST', '/utils/cache/clear', {})
  } catch {
    // optional
  }

  const check = await api(
    token,
    'GET',
    `/items/schedule_section?fields=id,title,groups.id,groups.title,groups.photo_1,groups.photo_2`,
  )
  console.log('  verify', JSON.stringify(check.data?.groups?.map((g) => ({ id: g.id, title: g.title, p1: g.photo_1, p2: g.photo_2 })), null, 2))
  console.log('Done. Change photos inside Занятия → Группы.')
}

main().catch((e) => {
  console.error(e.message)
  if (e.detail) console.error(JSON.stringify(e.detail, null, 2))
  process.exit(1)
})
