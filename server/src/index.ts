import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import { contactRouter } from './routes/contact.js'
import { demoLeadRouter } from './routes/demo-lead.js'

dotenv.config({ path: process.env.ENV_FILE ?? '../.env' })

const app = express()
const port = Number(process.env.PORT ?? 3000)
const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:5173'

app.use(helmet())
app.use(cors({ origin: corsOrigin }))
app.use(express.json({ limit: '32kb' }))

const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Слишком много запросов. Попробуйте позже.' }
})

app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' })
})

app.use('/api/contact', contactLimiter, contactRouter)
app.use('/api/demo-lead', contactLimiter, demoLeadRouter)

app.listen(port, () => {
    console.log(`API listening on port ${port}`)
})
