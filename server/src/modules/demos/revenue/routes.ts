import { Router } from 'express'
import { pool } from '../../../db/pool.js'
import {
    buildRevenuePlanResponse,
    buildRevenueReportResponse,
    hotelFixture,
    roomTypesFixture,
} from './service.js'

export const revenueRouter = Router()

revenueRouter.get('/demo/api/v1/hotel', (_req, res) => {
    res.json(hotelFixture)
})

revenueRouter.get('/demo/api/v1/room-types', (_req, res) => {
    res.json(roomTypesFixture)
})

revenueRouter.get('/demo/api/v1/reports/plan', async (_req, res) => {
    try {
        const stored = await pool.query<{ payload: unknown }>(
            'SELECT payload FROM demo_revenue_plans WHERE id = 1'
        )
        const payload = stored.rows[0]?.payload
        if (payload && typeof payload === 'object' && Object.keys(payload as object).length > 0) {
            res.json({ result: 'success', data: payload })
            return
        }
    } catch {
        // fall through to synthetic
    }
    res.json(buildRevenuePlanResponse())
})

revenueRouter.post('/demo/api/v1/reports/revenue', (req, res) => {
    res.json(buildRevenueReportResponse(req.body ?? {}))
})

revenueRouter.post('/demo/api/v1/reports/plan/save', async (req, res) => {
    const body = req.body ?? {}
    try {
        await pool.query(
            `INSERT INTO demo_revenue_plans (id, payload, updated_at)
             VALUES (1, $1::jsonb, NOW())
             ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()`,
            [JSON.stringify(body)]
        )
    } catch (error) {
        console.warn('[demos/revenue] plan persist skipped:', error)
    }
    res.json({ result: 'success', data: body })
})

revenueRouter.post('/reset', async (_req, res) => {
    try {
        await pool.query(
            `UPDATE demo_revenue_plans SET payload = '{}'::jsonb, updated_at = NOW() WHERE id = 1`
        )
    } catch {
        // ignore
    }
    res.json({ result: 'success', message: 'Revenue demo reset' })
})
