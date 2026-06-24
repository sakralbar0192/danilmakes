import { Router } from 'express'
import { query } from '../db/pool.js'
import { contactSchema } from '../middleware/validate.js'
import { sendContactNotification } from '../services/mail.js'

export const contactRouter = Router()

contactRouter.post('/', async (req, res) => {
    const parsed = contactSchema.safeParse(req.body)

    if (!parsed.success) {
        return res.status(400).json({
            message: 'Некорректные данные формы',
            errors: parsed.error.flatten().fieldErrors
        })
    }

    const { name, contact, message, budget } = parsed.data

    try {
        const result = await query<{ id: number }>(
            `INSERT INTO contact_requests (name, contact, message, budget)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
            [name, contact, message, budget ?? null]
        )

        const id = result.rows[0].id

        try {
            await sendContactNotification({ id, name, contact, message, budget })
        } catch (mailError) {
            console.error('Failed to send email notification:', mailError)
        }

        return res.status(201).json({ id, message: 'Заявка принята' })
    } catch (error) {
        console.error('Failed to save contact request:', error)
        return res.status(500).json({ message: 'Ошибка сервера' })
    }
})
