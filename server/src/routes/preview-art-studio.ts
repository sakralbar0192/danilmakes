import { createHmac, timingSafeEqual } from 'node:crypto'
import { Router } from 'express'

export const previewArtStudioRouter = Router()

const COOKIE = 'dm_preview_art'
const COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 7 // 7 days

function getPassword(): string {
    return process.env.ART_STUDIO_PREVIEW_PASSWORD ?? ''
}

function getSecret(): string {
    return (
        process.env.ART_STUDIO_PREVIEW_SECRET ??
        process.env.ART_STUDIO_PREVIEW_PASSWORD ??
        'dev-only-change-me'
    )
}

function expectedToken(): string {
    return createHmac('sha256', getSecret()).update('art-studio-preview-v1').digest('hex')
}

function readCookie(header: string | undefined, name: string): string | null {
    if (!header) return null
    for (const part of header.split(';')) {
        const [k, ...rest] = part.trim().split('=')
        if (k === name) return decodeURIComponent(rest.join('='))
    }
    return null
}

function tokensEqual(a: string, b: string): boolean {
    const ba = Buffer.from(a)
    const bb = Buffer.from(b)
    if (ba.length !== bb.length) return false
    return timingSafeEqual(ba, bb)
}

function setPreviewCookie(res: import('express').Response): void {
    const secure = process.env.NODE_ENV === 'production'
    const parts = [
        `${COOKIE}=${encodeURIComponent(expectedToken())}`,
        'Path=/artStudio/',
        'HttpOnly',
        'SameSite=Lax',
        `Max-Age=${COOKIE_MAX_AGE_SEC}`,
    ]
    if (secure) parts.push('Secure')
    res.setHeader('Set-Cookie', parts.join('; '))
}

function clearPreviewCookie(res: import('express').Response): void {
    const secure = process.env.NODE_ENV === 'production'
    const parts = [
        `${COOKIE}=`,
        'Path=/artStudio/',
        'HttpOnly',
        'SameSite=Lax',
        'Max-Age=0',
    ]
    if (secure) parts.push('Secure')
    res.setHeader('Set-Cookie', parts.join('; '))
}

/** nginx auth_request: 200 = allow, 401 = deny */
previewArtStudioRouter.get('/auth', (req, res) => {
    const password = getPassword()
    if (!password) {
        res.status(401).end()
        return
    }
    const token = readCookie(req.headers.cookie, COOKIE)
    if (token && tokensEqual(token, expectedToken())) {
        res.status(200).end()
        return
    }
    res.status(401).end()
})

previewArtStudioRouter.post('/unlock', (req, res) => {
    const configured = getPassword()
    if (!configured) {
        res.status(503).json({ message: 'Превью временно недоступно' })
        return
    }

    const password = typeof req.body?.password === 'string' ? req.body.password : ''
    const a = Buffer.from(password)
    const b = Buffer.from(configured)
    const ok = a.length === b.length && a.length > 0 && timingSafeEqual(a, b)

    if (!ok) {
        res.status(401).json({ message: 'Неверный пароль' })
        return
    }

    setPreviewCookie(res)
    res.json({ ok: true, redirect: '/artStudio/' })
})

previewArtStudioRouter.post('/lock', (_req, res) => {
    clearPreviewCookie(res)
    res.json({ ok: true })
})
