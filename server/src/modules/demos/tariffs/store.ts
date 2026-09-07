import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pool } from '../../../db/pool.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

function resolveFixturesRoot(): string {
    const fromEnv = process.env.DEMO_TARIFF_FIXTURES
    if (fromEnv && existsSync(fromEnv)) {
        return fromEnv
    }

    const candidates = [
        join(__dirname, 'fixtures'),
        join(__dirname, '../../../../../demos/tariff-prices/src/mocks/fixtures'),
        join(process.cwd(), 'fixtures/tariffs'),
        join(process.cwd(), '../demos/tariff-prices/src/mocks/fixtures'),
    ]

    for (const candidate of candidates) {
        if (existsSync(join(candidate, 'hotel-get.json'))) {
            return candidate
        }
    }

    throw new Error('Tariff demo fixtures not found. Set DEMO_TARIFF_FIXTURES or copy fixtures.')
}

const fixturesRoot = resolveFixturesRoot()

function readJson(rel: string): unknown {
    return JSON.parse(readFileSync(join(fixturesRoot, rel), 'utf-8'))
}

const staticFiles = {
    hotel: () => readJson('hotel-get.json'),
    tariff: () => readJson('tariff-get.json'),
    roomTypes: () => readJson('roomtypes-get.json'),
    service: () => readJson('service-get.json'),
}

const calendarPartFiles: Record<string, string> = {
    base: 'calendar/base.json',
    planPrices: 'calendar/planPrices.json',
    meta: 'calendar/meta.json',
    restrictions: 'calendar/restrictions.json',
    dynamic: 'calendar/dynamic.json',
    extra: 'calendar/extra.json',
    otherTariffsPrices: 'calendar/otherTariffsPrices.json',
    otherTariffsExtra: 'calendar/otherTariffsExtra.json',
}

type Overlay = {
    planPrices?: Record<string, unknown>
    meta?: Record<string, unknown>
    restrictions?: Record<string, unknown>
    dynamic?: Record<string, unknown>
    availability?: Record<string, unknown>
}

let memoryOverlay: Overlay = {}

async function loadOverlayFromDb(): Promise<Overlay> {
    try {
        const result = await pool.query<{ payload: Overlay }>(
            'SELECT payload FROM demo_tariff_overlays WHERE id = 1'
        )
        return result.rows[0]?.payload ?? {}
    } catch {
        return memoryOverlay
    }
}

async function saveOverlay(overlay: Overlay): Promise<void> {
    memoryOverlay = overlay
    try {
        await pool.query(
            `INSERT INTO demo_tariff_overlays (id, payload, updated_at)
             VALUES (1, $1::jsonb, NOW())
             ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()`,
            [JSON.stringify(overlay)]
        )
    } catch (error) {
        console.warn('[demos/tariffs] overlay persist skipped:', error)
    }
}

function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>) {
    for (const [key, value] of Object.entries(source)) {
        if (
            value
            && typeof value === 'object'
            && !Array.isArray(value)
            && target[key]
            && typeof target[key] === 'object'
            && !Array.isArray(target[key])
        ) {
            deepMerge(target[key] as Record<string, unknown>, value as Record<string, unknown>)
        } else {
            target[key] = value
        }
    }
    return target
}

export async function getStatic(kind: keyof typeof staticFiles) {
    return staticFiles[kind]()
}

export async function getCalendarParts(parts: string[]) {
    const overlay = { ...memoryOverlay, ...(await loadOverlayFromDb()) }
    const merged: Record<string, unknown> = {}

    for (const part of parts) {
        const file = calendarPartFiles[part]
        if (!file) continue
        const data = readJson(file) as Record<string, unknown>
        Object.assign(merged, structuredClone(data))
    }

    if (overlay.planPrices && parts.includes('planPrices')) {
        deepMerge(merged, overlay.planPrices)
    }
    if (overlay.meta && parts.includes('meta')) {
        deepMerge(merged, overlay.meta)
    }
    if (overlay.availability && parts.includes('meta')) {
        const availability = (merged.availability ?? {}) as Record<string, unknown>
        deepMerge(availability, overlay.availability)
        merged.availability = availability
    }
    if (overlay.restrictions && parts.includes('restrictions')) {
        deepMerge(merged, overlay.restrictions)
    }
    if (overlay.dynamic && parts.includes('dynamic')) {
        deepMerge(merged, overlay.dynamic)
    }

    return merged
}

export async function applyPriceUpdate(body: Record<string, unknown>) {
    const overlay = { ...memoryOverlay, ...(await loadOverlayFromDb()) }
    overlay.planPrices = overlay.planPrices ?? {}

    if (body.prices && typeof body.prices === 'object') {
        deepMerge(overlay.planPrices as Record<string, unknown>, {
            prices_all: body.prices,
            plan_prices: body.prices,
        })
    }
    if (body.dynamic_prices && typeof body.dynamic_prices === 'object') {
        overlay.dynamic = overlay.dynamic ?? {}
        deepMerge(overlay.dynamic as Record<string, unknown>, {
            rms_prices_all: body.dynamic_prices,
        })
    }
    if (body.availability && typeof body.availability === 'object') {
        overlay.availability = overlay.availability ?? {}
        deepMerge(overlay.availability as Record<string, unknown>, body.availability as Record<string, unknown>)
    }
    if (body.restrictions && typeof body.restrictions === 'object') {
        overlay.restrictions = overlay.restrictions ?? {}
        deepMerge(overlay.restrictions as Record<string, unknown>, {
            restrictions: body.restrictions,
        })
    }

    await saveOverlay(overlay)
    return { result: 'success' as const }
}

export async function applyMassiveAvailability(body: Record<string, unknown>) {
    const overlay = { ...memoryOverlay, ...(await loadOverlayFromDb()) }
    overlay.availability = overlay.availability ?? {}

    const massive = body.availability_massive as Record<string, Record<string, number>> | undefined
    const periods = body.date_periods as Array<{ from?: string; to?: string }> | undefined

    if (massive && periods?.length) {
        for (const [roomtypeId, weekdays] of Object.entries(massive)) {
            const room = ((overlay.availability as Record<string, unknown>)[roomtypeId]
                ?? {}) as Record<string, number>
            for (const period of periods) {
                if (!period.from || !period.to) continue
                const from = new Date(period.from)
                const to = new Date(period.to)
                for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
                    const key = d.toISOString().slice(0, 10)
                    const weekday = String((d.getDay() + 6) % 7)
                    if (weekdays[weekday] != null) {
                        room[key] = weekdays[weekday]
                    }
                }
            }
            ;(overlay.availability as Record<string, unknown>)[roomtypeId] = room
        }
    }

    await saveOverlay(overlay)
    return { result: 'success' as const }
}

export async function resetTariffs() {
    memoryOverlay = {}
    await saveOverlay({})
    return { result: 'success' as const, message: 'Tariff demo reset to seed' }
}
