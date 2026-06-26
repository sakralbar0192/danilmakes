export async function sendTelegramNotification(text: string): Promise<boolean> {
    const token = process.env.TELEGRAM_BOT_TOKEN
    const chatId = process.env.TELEGRAM_CHAT_ID

    if (!token || !chatId) {
        console.warn('[demo-lead] Telegram not configured, skipping notification')
        return false
    }

    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            text,
            disable_web_page_preview: true
        })
    })

    if (!response.ok) {
        const body = await response.text()
        throw new Error(`Telegram API error: ${response.status} ${body}`)
    }

    return true
}
