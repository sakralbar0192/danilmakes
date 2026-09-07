#!/usr/bin/env node
/**
 * Cleanup site_settings:
 * - one phone field (display form); hide phone_display + max_messenger
 * - hide directions_* (section copy is static; chips live in Directions)
 *
 *   DIRECTUS_URL=http://127.0.0.1:8055 npm run directus:cleanup-settings
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

const HIDE = [
  ['phone_display', 'Устарело: используйте одно поле phone'],
  ['max_messenger', 'Устарело: телефон один — поле phone'],
  ['directions_eyebrow', 'Устарело: заголовки блока статичны; чипы — в Directions'],
  ['directions_title', 'Устарело: заголовки блока статичны; чипы — в Directions'],
  ['directions_lead', 'Устарело: заголовки блока статичны; чипы — в Directions'],
]

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
  const json = await api(null, 'POST', '/auth/login', { email: EMAIL, password: PASSWORD })
  return json.data.access_token
}

async function fieldsOf(token, collection) {
  const list = await api(token, 'GET', `/fields/${collection}`)
  return new Map((list.data || []).map((f) => [f.field, f]))
}

async function hideField(token, collection, field, note) {
  const map = await fieldsOf(token, collection)
  if (!map.has(field)) {
    console.log(`  skip missing ${collection}.${field}`)
    return
  }
  await api(token, 'PATCH', `/fields/${collection}/${field}`, {
    meta: { hidden: true, note },
  })
  console.log(`  hid ${collection}.${field}`)
}

function looksDisplay(phone) {
  return /[()\s-]/.test(phone || '')
}

async function consolidatePhone(token) {
  const s = (await api(token, 'GET', '/items/site_settings')).data || {}
  let phone = s.phone || ''
  const display = s.phone_display || ''
  if (display && (!phone || !looksDisplay(phone))) {
    phone = display
  } else if (phone && !looksDisplay(phone) && display) {
    phone = display
  } else if (phone && !looksDisplay(phone)) {
    // +79333223803 → +7 (933) 322-38-03
    const digits = phone.replace(/\D/g, '')
    if (digits.length === 11 && digits.startsWith('7')) {
      phone = `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`
    }
  }
  await api(token, 'PATCH', '/items/site_settings', { phone })
  await api(token, 'PATCH', '/fields/site_settings/phone', {
    meta: { note: 'Как на сайте: +7 (933) 322-38-03. Для tel: берутся только цифры.' },
  })
  console.log(`  phone → ${phone}`)
}

async function main() {
  console.log(`Cleanup site_settings → ${BASE}`)
  const token = await loginToken()
  await consolidatePhone(token)
  for (const [field, note] of HIDE) {
    await hideField(token, 'site_settings', field, note)
  }
  console.log('Done.')
}

main().catch((e) => {
  console.error(e.message)
  if (e.detail) console.error(JSON.stringify(e.detail, null, 2))
  process.exit(1)
})
