import nodemailer from 'nodemailer'

export interface DemoLeadNotification {
    name: string
    phone: string
    message?: string
    source: string
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

export async function sendDemoLeadNotification(data: DemoLeadNotification): Promise<boolean> {
    const notifyEmail = process.env.NOTIFY_EMAIL
    const transporter = createTransporter()

    if (!transporter || !notifyEmail) {
        console.warn('[demo-lead] SMTP not configured, skipping email notification')
        return false
    }

    const messageLine = data.message ? `Комментарий: ${data.message}\n` : ''

    await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: notifyEmail,
        subject: `[danilmakes demo] Заявка: ${data.name}`,
        text: [
            `Источник: ${data.source}`,
            `Имя: ${data.name}`,
            `Телефон: ${data.phone}`,
            messageLine,
            '',
            '---',
            'Портфолио-демо: форма → Telegram + почта'
        ].filter(Boolean).join('\n')
    })

    return true
}
