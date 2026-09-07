import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import { pool } from './pool.js'

dotenv.config({ path: process.env.ENV_FILE ?? '../.env' })

const __dirname = dirname(fileURLToPath(import.meta.url))
const migrationsDir = join(__dirname, 'migrations')

async function migrate() {
    const files = readdirSync(migrationsDir)
        .filter(name => name.endsWith('.sql'))
        .sort()

    for (const file of files) {
        const sql = readFileSync(join(migrationsDir, file), 'utf-8')
        await pool.query(sql)
        console.log(`Applied ${file}`)
    }

    console.log('Migrations applied successfully')
    await pool.end()
}

migrate().catch((error) => {
    console.error('Migration failed:', error)
    process.exit(1)
})
