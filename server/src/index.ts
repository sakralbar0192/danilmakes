import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import { contactRouter } from './routes/contact.js'
import { demoLeadRouter } from './routes/demo-lead.js'
import { previewArtStudioRouter } from './routes/preview-art-studio.js'
import { demosRouter } from './modules/demos/index.js'

dotenv.config({ path: process.env.ENV_FILE ?? '../.env' })

const app = express()
const port = Number(process.env.PORT ?? 3000)
const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:5173'

app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}))
app.use(cors({ origin: corsOrigin, credentials: true }))
app.use(express.json({ limit: '512kb' }))

const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Слишком много запросов. Попробуйте позже.' }
})

const previewUnlockLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Слишком много попыток. Попробуйте позже.' }
})

const demosLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Слишком много запросов к демо API.' }
})

app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' })
})

app.use('/api/contact', contactLimiter, contactRouter)
app.use('/api/demo-lead', contactLimiter, demoLeadRouter)
app.use('/api/preview/art-studio/unlock', previewUnlockLimiter)
app.use('/api/preview/art-studio', previewArtStudioRouter)
app.use('/api/demos', demosLimiter, demosRouter)

app.listen(port, () => {
    console.log(`API listening on port ${port}`)
})
