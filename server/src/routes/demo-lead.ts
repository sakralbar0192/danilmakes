import { Router } from 'express'
import { demoLeadSchema } from '../middleware/validate.js'
import { sendDemoLeadNotification } from '../services/demo-lead-mail.js'
import { sendTelegramNotification } from '../services/telegram.js'

export const demoLeadRouter = Router()

const SOURCE_LABELS: Record<string, string> = {
    'local-landing': 'Лендинг «Студия Линия»',
    'form-integration': 'Демо «Форма → Telegram»'
}

demoLeadRouter.post('/', async (req, res) => {
    const parsed = demoLeadSchema.safeParse(req.body)

    if (!parsed.success) {
        return res.status(400).json({
            message: 'Некорректные данные формы',
            errors: parsed.error.flatten().fieldErrors
        })
    }

    if (parsed.data.website) {
        return res.status(201).json({ message: 'Заявка принята', delivered: { email: false, telegram: false } })
    }

    const { name, phone, message, source } = parsed.data
    const sourceLabel = SOURCE_LABELS[source] ?? source

    const telegramText = [
        `📋 Заявка с демо-сайта`,
        `Источник: ${sourceLabel}`,
        `Имя: ${name}`,
        `Телефон: ${phone}`,
        message ? `Комментарий: ${message}` : null
    ].filter(Boolean).join('\n')

    let emailDelivered = false
    let telegramDelivered = false

    try {
        emailDelivered = await sendDemoLeadNotification({ name, phone, message, source: sourceLabel })
    } catch (error) {
        console.error('[demo-lead] Email failed:', error)
    }

    try {
        telegramDelivered = await sendTelegramNotification(telegramText)
    } catch (error) {
        console.error('[demo-lead] Telegram failed:', error)
    }

    if (!emailDelivered && !telegramDelivered) {
        console.info('[demo-lead] Demo mode — заявка принята без доставки:', { name, phone, source })
    }

    return res.status(201).json({
        message: 'Заявка принята',
        delivered: {
            email: emailDelivered,
            telegram: telegramDelivered
        },
        demoMode: !emailDelivered && !telegramDelivered
    })
})
