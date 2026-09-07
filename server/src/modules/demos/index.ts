import { Router } from 'express'
import { tariffsRouter } from './tariffs/routes.js'
import { revenueRouter } from './revenue/routes.js'
import { xlsxRouter } from './xlsx/routes.js'
import { onceRouter } from './once/routes.js'

export const demosRouter = Router()

demosRouter.get('/health', (_req, res) => {
    res.json({ status: 'ok', demos: ['tariffs', 'revenue', 'xlsx', 'once'] })
})

demosRouter.use('/tariffs', tariffsRouter)
demosRouter.use('/revenue', revenueRouter)
demosRouter.use('/xlsx', xlsxRouter)
demosRouter.use('/once', onceRouter)
