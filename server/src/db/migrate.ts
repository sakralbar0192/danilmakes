import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import { pool } from './pool.js'

dotenv.config({ path: process.env.ENV_FILE ?? '../.env' })

const __dirname = dirname(fileURLToPath(import.meta.url))

async function migrate() {
    const sql = readFileSync(
        join(__dirname, 'migrations', '001_contact_requests.sql'),
        'utf-8'
    )

    await pool.query(sql)
    console.log('Migrations applied successfully')
    await pool.end()
}

migrate().catch((error) => {
    console.error('Migration failed:', error)
    process.exit(1)
})
