import { Router } from 'express'
import {
    applyMassiveAvailability,
    applyPriceUpdate,
    getCalendarParts,
    getStatic,
    resetTariffs,
} from './store.js'

export const tariffsRouter = Router()

tariffsRouter.get('/hotel/get', async (_req, res) => {
    res.json(await getStatic('hotel'))
})

tariffsRouter.get('/tariff/get', async (_req, res) => {
    res.json(await getStatic('tariff'))
})

tariffsRouter.get('/roomTypes/get', async (_req, res) => {
    res.json(await getStatic('roomTypes'))
})

tariffsRouter.get('/service/get', async (_req, res) => {
    res.json(await getStatic('service'))
})

tariffsRouter.get('/tariff/getPricesAndRestrictionsData', async (req, res) => {
    const partsParam = String(req.query.parts ?? 'base')
    const parts = partsParam.split(',').map(p => p.trim()).filter(Boolean)
    res.json(await getCalendarParts(parts))
})

tariffsRouter.post('/tariff/updatePrices', async (req, res) => {
    res.json(await applyPriceUpdate(req.body ?? {}))
})

tariffsRouter.post('/tariff/updateMassivePrices', async (req, res) => {
    res.json(await applyPriceUpdate(req.body ?? {}))
})

tariffsRouter.post('/tariff/updateMassiveAvailability', async (req, res) => {
    res.json(await applyMassiveAvailability(req.body ?? {}))
})

tariffsRouter.post('/tariff/restrictions_massive_update_any_plans', (_req, res) => {
    res.json({ result: 'success' })
})

tariffsRouter.post('/tariff/save_price_and_restrictions_choosen_categories_filter', (_req, res) => {
    res.json({ result: 'success' })
})

tariffsRouter.post('/tariff/save_price_and_restrictions_choosen_restrictions_filter', (_req, res) => {
    res.json({ result: 'success' })
})

tariffsRouter.post('/tariff/save_price_and_restrictions_choosen_restriction_view_mode', (_req, res) => {
    res.json({ result: 'success' })
})

tariffsRouter.post('/tariff/save_interface_settings', (_req, res) => {
    res.json({ result: 'success' })
})

tariffsRouter.post('/tariff/setMain', (_req, res) => {
    res.json({ result: 'success' })
})

tariffsRouter.post('/reset', async (_req, res) => {
    res.json(await resetTariffs())
})
