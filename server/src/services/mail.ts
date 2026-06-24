import nodemailer from 'nodemailer'

interface ContactNotification {
    id: number
    name: string
    contact: string
    message: string
    budget?: string | null
}

function createTransporter() {
    const host = process.env.SMTP_HOST
    const port = Number(process.env.SMTP_PORT ?? 465)
    const user = process.env.SMTP_USER
    const pass = process.env.SMTP_PASS

    if (!host || !user || !pass) {
        return null
    }

    return nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass }
    })
}

export async function sendContactNotification(data: ContactNotification): Promise<void> {
    const notifyEmail = process.env.NOTIFY_EMAIL
    const transporter = createTransporter()

    if (!transporter || !notifyEmail) {
        console.warn('SMTP not configured, skipping email notification')
        return
    }

    const budgetLine = data.budget ? `Бюджет: ${data.budget}\n` : ''

    await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: notifyEmail,
        subject: `[danilmakes] Новая заявка от ${data.name}`,
        text: [
            `Имя: ${data.name}`,
            `Контакт: ${data.contact}`,
            budgetLine,
            `Сообщение:\n${data.message}`,
            '',
            '---',
            `Заявка сохранена в БД, id: ${data.id}`
        ].filter(Boolean).join('\n')
    })
}
