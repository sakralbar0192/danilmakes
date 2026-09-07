import { Router } from 'express'
import { pool } from '../../../db/pool.js'

export const onceRouter = Router()

const HOTEL_COUNT = 40

async function ensureSeed() {
    const count = await pool.query<{ count: string }>('SELECT COUNT(*)::text AS count FROM demo_once_hotels')
    if (Number(count.rows[0]?.count ?? 0) > 0) return

    const values: string[] = []
    const params: unknown[] = []
    for (let id = 1; id <= HOTEL_COUNT; id += 1) {
        const invalid = id % 7 === 0
        params.push(id, invalid ? 1 : 0, false)
        const i = params.length
        values.push(`($${i - 2}, $${i - 1}, $${i})`)
    }
    await pool.query(
        `INSERT INTO demo_once_hotels (hotel_id, deadline_calc_mode, fixed)
         VALUES ${values.join(',')}
         ON CONFLICT (hotel_id) DO NOTHING`,
        params
    )
}

onceRouter.post('/reset', async (_req, res) => {
    await pool.query('DELETE FROM demo_once_jobs')
    await pool.query('DELETE FROM demo_once_hotels')
    await ensureSeed()
    res.json({ result: 'success', hotels: HOTEL_COUNT })
})

onceRouter.get('/status', async (_req, res) => {
    await ensureSeed()
    const hotels = await pool.query(
        `SELECT
            COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE deadline_calc_mode = 1 AND fixed = false)::int AS invalid,
            COUNT(*) FILTER (WHERE fixed)::int AS fixed
         FROM demo_once_hotels`
    )
    const jobs = await pool.query(
        `SELECT id, mode, status, start_hotel_id, cursor_hotel_id, processed, fixed_count, log, created_at, updated_at
         FROM demo_once_jobs
         ORDER BY id DESC
         LIMIT 5`
    )
    res.json({ hotels: hotels.rows[0], jobs: jobs.rows })
})

onceRouter.post('/jobs', async (req, res) => {
    await ensureSeed()
    const mode = req.body?.mode === 'apply' ? 'apply' : 'dry_run'
    const startHotelId = Math.max(1, Number(req.body?.start_hotel_id ?? 1))

    const inserted = await pool.query(
        `INSERT INTO demo_once_jobs (mode, status, start_hotel_id, cursor_hotel_id)
         VALUES ($1, 'running', $2, $2)
         RETURNING *`,
        [mode, startHotelId]
    )
    const job = inserted.rows[0]

    const chunkSize = Math.min(Math.max(Number(req.body?.chunk_size ?? 5), 1), 20)
    const maxChunks = Math.min(Math.max(Number(req.body?.max_chunks ?? 3), 1), 10)
    const log: string[] = []
    let processed = 0
    let fixedCount = 0
    let cursor = startHotelId
    let stopped = false

    for (let chunk = 0; chunk < maxChunks; chunk += 1) {
        const batch = await pool.query<{ hotel_id: number; deadline_calc_mode: number }>(
            `SELECT hotel_id, deadline_calc_mode
             FROM demo_once_hotels
             WHERE hotel_id >= $1
             ORDER BY hotel_id
             LIMIT $2`,
            [cursor, chunkSize]
        )

        if (batch.rows.length === 0) {
            log.push(`chunk ${chunk + 1}: no more hotels`)
            cursor = HOTEL_COUNT + 1
            break
        }

        for (const row of batch.rows) {
            processed += 1
            cursor = row.hotel_id + 1
            if (row.deadline_calc_mode === 1) {
                if (mode === 'apply') {
                    await pool.query(
                        `UPDATE demo_once_hotels SET fixed = true, deadline_calc_mode = 0 WHERE hotel_id = $1`,
                        [row.hotel_id]
                    )
                }
                fixedCount += 1
                log.push(`${mode}: hotel ${row.hotel_id} invalid deadline_calc_mode`)
            }
        }

        // Simulated failure mid-run for resume demo when requested
        if (req.body?.simulate_fail && chunk === 0) {
            log.push(`stopped with resume hint --start_hotel_id=${cursor}`)
            stopped = true
            break
        }
    }

    const status = stopped ? 'paused' : (cursor > HOTEL_COUNT ? 'done' : 'paused')
    const updated = await pool.query(
        `UPDATE demo_once_jobs
         SET status = $2,
             cursor_hotel_id = $3,
             processed = $4,
             fixed_count = $5,
             log = $6::jsonb,
             updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [job.id, status, cursor, processed, fixedCount, JSON.stringify(log)]
    )

    res.json({
        result: 'success',
        job: updated.rows[0],
        resume_hint: status !== 'done' ? `--start_hotel_id=${cursor}` : null,
    })
})

onceRouter.post('/jobs/:id/resume', async (req, res) => {
    const id = Number(req.params.id)
    const existing = await pool.query(`SELECT * FROM demo_once_jobs WHERE id = $1`, [id])
    if (!existing.rows[0]) {
        res.status(404).json({ message: 'Job not found' })
        return
    }

    const job = existing.rows[0]
    req.body = {
        mode: job.mode,
        start_hotel_id: job.cursor_hotel_id,
        chunk_size: 5,
        max_chunks: 8,
        simulate_fail: false,
    }

    // Reuse create path semantics by forwarding
    const mode = job.mode
    const startHotelId = Number(job.cursor_hotel_id)
    const chunkSize = 5
    const log: string[] = Array.isArray(job.log) ? [...job.log] : []
    let processed = Number(job.processed)
    let fixedCount = Number(job.fixed_count)
    let cursor = startHotelId

    while (cursor <= HOTEL_COUNT) {
        const batch = await pool.query<{ hotel_id: number; deadline_calc_mode: number }>(
            `SELECT hotel_id, deadline_calc_mode
             FROM demo_once_hotels
             WHERE hotel_id >= $1
             ORDER BY hotel_id
             LIMIT $2`,
            [cursor, chunkSize]
        )
        if (batch.rows.length === 0) break

        for (const row of batch.rows) {
            processed += 1
            cursor = row.hotel_id + 1
            if (row.deadline_calc_mode === 1) {
                if (mode === 'apply') {
                    await pool.query(
                        `UPDATE demo_once_hotels SET fixed = true, deadline_calc_mode = 0 WHERE hotel_id = $1`,
                        [row.hotel_id]
                    )
                }
                fixedCount += 1
                log.push(`resume ${mode}: hotel ${row.hotel_id}`)
            }
        }
    }

    const updated = await pool.query(
        `UPDATE demo_once_jobs
         SET status = 'done',
             cursor_hotel_id = $2,
             processed = $3,
             fixed_count = $4,
             log = $5::jsonb,
             updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [id, cursor, processed, fixedCount, JSON.stringify(log)]
    )

    res.json({ result: 'success', job: updated.rows[0] })
})
