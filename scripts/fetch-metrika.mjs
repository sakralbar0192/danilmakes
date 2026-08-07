#!/usr/bin/env node
/**
 * Выгрузка отчётов Яндекс.Метрики (Reports API).
 *
 * Требует в .env:
 *   YANDEX_METRIKA_TOKEN=...
 *   YANDEX_METRIKA_COUNTER_ID=110107124  (опционально)
 *
 * Usage:
 *   node scripts/fetch-metrika.mjs
 *   node scripts/fetch-metrika.mjs --date1=2025-01-01 --date2=today
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const outDir = path.join(root, 'tmp', 'metrika')

const DEFAULT_COUNTER = '110107124'
const API = 'https://api-metrika.yandex.net'

function loadEnv(filePath) {
    if (!fs.existsSync(filePath)) return {}
    const vars = {}
    for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) continue
        const eq = trimmed.indexOf('=')
        if (eq === -1) continue
        const key = trimmed.slice(0, eq).trim()
        let value = trimmed.slice(eq + 1).trim()
        if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
        ) {
            value = value.slice(1, -1)
        }
        vars[key] = value
    }
    return vars
}

function parseArgs(argv) {
    const args = { date1: '365daysAgo', date2: 'today' }
    for (const arg of argv) {
        if (arg.startsWith('--date1=')) args.date1 = arg.slice('--date1='.length)
        if (arg.startsWith('--date2=')) args.date2 = arg.slice('--date2='.length)
    }
    return args
}

async function metrikaGet(token, pathname, params = {}) {
    const url = new URL(pathname.startsWith('http') ? pathname : `${API}${pathname}`)
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
            url.searchParams.set(key, String(value))
        }
    }

    const res = await fetch(url, {
        headers: {
            Authorization: `OAuth ${token}`,
            'Content-Type': 'application/x-yametrika+json',
        },
    })

    const text = await res.text()
    let body
    try {
        body = JSON.parse(text)
    } catch {
        body = { raw: text }
    }

    if (!res.ok) {
        const message = body?.message || body?.errors?.[0]?.message || text.slice(0, 300)
        throw new Error(`HTTP ${res.status} ${pathname}: ${message}`)
    }

    return body
}

function reportParams(ids, date1, date2, extra) {
    return {
        ids,
        date1,
        date2,
        accuracy: 'full',
        limit: 100,
        ...extra,
    }
}

function summarizeTable(data, { maxRows = 15 } = {}) {
    if (!data?.data?.length) return []
    return data.data.slice(0, maxRows).map((row) => ({
        dimensions: (row.dimensions || []).map((d) => d.name ?? d.id ?? d),
        metrics: row.metrics,
    }))
}

async function main() {
    const env = { ...loadEnv(path.join(root, '.env')), ...process.env }
    const token = env.YANDEX_METRIKA_TOKEN
    const counterId = env.YANDEX_METRIKA_COUNTER_ID || DEFAULT_COUNTER
    const { date1, date2 } = parseArgs(process.argv.slice(2))

    if (!token) {
        console.error(
            'Нет YANDEX_METRIKA_TOKEN.\n' +
                'Добавьте в .env (файл в корне репо, уже в .gitignore):\n' +
                '  YANDEX_METRIKA_TOKEN=ваш_oauth_токен\n' +
                '  YANDEX_METRIKA_COUNTER_ID=110107124',
        )
        process.exit(1)
    }

    fs.mkdirSync(outDir, { recursive: true })

    console.log(`Счётчик ${counterId}, период ${date1} → ${date2}`)

    const overview = await metrikaGet(token, '/stat/v1/data', reportParams(counterId, date1, date2, {
        metrics: [
            'ym:s:visits',
            'ym:s:users',
            'ym:s:pageviews',
            'ym:s:bounceRate',
            'ym:s:avgVisitDurationSeconds',
            'ym:s:pageDepth',
        ].join(','),
    }))

    const reports = {
        meta: {
            counterId,
            date1,
            date2,
            fetchedAt: new Date().toISOString(),
        },
        overview: {
            totals: overview.totals,
            metrics: overview.query?.metrics,
        },
        byDay: await metrikaGet(token, '/stat/v1/data', reportParams(counterId, date1, date2, {
            metrics: 'ym:s:visits,ym:s:users,ym:s:bounceRate',
            dimensions: 'ym:s:date',
            sort: 'ym:s:date',
            limit: 400,
        })),
        trafficSources: await metrikaGet(token, '/stat/v1/data', reportParams(counterId, date1, date2, {
            metrics: 'ym:s:visits,ym:s:users,ym:s:bounceRate,ym:s:avgVisitDurationSeconds',
            dimensions: 'ym:s:trafficSource',
            sort: '-ym:s:visits',
        })),
        searchEngines: await metrikaGet(token, '/stat/v1/data', reportParams(counterId, date1, date2, {
            metrics: 'ym:s:visits,ym:s:users,ym:s:bounceRate',
            dimensions: 'ym:s:searchEngine',
            sort: '-ym:s:visits',
        })),
        entryPages: await metrikaGet(token, '/stat/v1/data', reportParams(counterId, date1, date2, {
            metrics: 'ym:s:visits,ym:s:bounceRate,ym:s:avgVisitDurationSeconds',
            dimensions: 'ym:s:startURLPathFull',
            sort: '-ym:s:visits',
        })),
        popularPages: await metrikaGet(token, '/stat/v1/data', reportParams(counterId, date1, date2, {
            metrics: 'ym:pv:pageviews,ym:pv:users',
            dimensions: 'ym:pv:URLPathFull',
            sort: '-ym:pv:pageviews',
        })),
        devices: await metrikaGet(token, '/stat/v1/data', reportParams(counterId, date1, date2, {
            metrics: 'ym:s:visits,ym:s:bounceRate,ym:s:avgVisitDurationSeconds',
            dimensions: 'ym:s:deviceCategory',
            sort: '-ym:s:visits',
        })),
        browsers: await metrikaGet(token, '/stat/v1/data', reportParams(counterId, date1, date2, {
            metrics: 'ym:s:visits,ym:s:bounceRate',
            dimensions: 'ym:s:browser',
            sort: '-ym:s:visits',
            limit: 20,
        })),
        regions: await metrikaGet(token, '/stat/v1/data', reportParams(counterId, date1, date2, {
            metrics: 'ym:s:visits,ym:s:users',
            dimensions: 'ym:s:regionCity',
            sort: '-ym:s:visits',
            limit: 30,
        })),
        newVsReturning: await metrikaGet(token, '/stat/v1/data', reportParams(counterId, date1, date2, {
            metrics: 'ym:s:visits,ym:s:bounceRate,ym:s:avgVisitDurationSeconds',
            dimensions: 'ym:s:isNewUser',
        })),
        goals: await metrikaGet(token, `/management/v1/counter/${counterId}/goals`),
    }

    // Достижения целей — по ID из management API
    const goalList = reports.goals?.goals || []
    const goalReaches = {}
    for (const goal of goalList) {
        const goalId = goal.id
        if (!goalId) continue
        try {
            goalReaches[goal.name || String(goalId)] = await metrikaGet(
                token,
                '/stat/v1/data',
                reportParams(counterId, date1, date2, {
                    metrics: `ym:s:goal${goalId}reaches,ym:s:goal${goalId}conversionRate`,
                }),
            )
        } catch (err) {
            goalReaches[goal.name || String(goalId)] = { error: String(err.message || err) }
        }
    }
    reports.goalReaches = goalReaches

    const fullPath = path.join(outDir, 'report-full.json')
    const summaryPath = path.join(outDir, 'report-summary.json')

    const summary = {
        meta: reports.meta,
        overview: reports.overview,
        trafficSources: summarizeTable(reports.trafficSources),
        searchEngines: summarizeTable(reports.searchEngines),
        entryPages: summarizeTable(reports.entryPages),
        popularPages: summarizeTable(reports.popularPages),
        devices: summarizeTable(reports.devices),
        browsers: summarizeTable(reports.browsers, { maxRows: 10 }),
        regions: summarizeTable(reports.regions),
        newVsReturning: summarizeTable(reports.newVsReturning),
        goals: goalList.map((g) => ({
            id: g.id,
            name: g.name,
            type: g.type,
            conditions: g.conditions,
        })),
        goalReaches: Object.fromEntries(
            Object.entries(goalReaches).map(([name, data]) => [
                name,
                data.error
                    ? { error: data.error }
                    : { totals: data.totals, metrics: data.query?.metrics },
            ]),
        ),
    }

    fs.writeFileSync(fullPath, JSON.stringify(reports, null, 2))
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2))

    const [visits, users, pageviews, bounceRate, avgDuration, depth] = overview.totals || []
    console.log('')
    console.log('Обзор:')
    console.log(`  Визиты:        ${visits ?? '—'}`)
    console.log(`  Пользователи:  ${users ?? '—'}`)
    console.log(`  Просмотры:     ${pageviews ?? '—'}`)
    console.log(`  Отказы:        ${bounceRate != null ? `${Number(bounceRate).toFixed(1)}%` : '—'}`)
    console.log(`  Ср. длит.:     ${avgDuration != null ? `${Math.round(avgDuration)} с` : '—'}`)
    console.log(`  Глубина:       ${depth != null ? Number(depth).toFixed(2) : '—'}`)
    console.log(`  Целей в счётчике: ${goalList.length}`)
    console.log('')
    console.log(`Записано:\n  ${summaryPath}\n  ${fullPath}`)
}

main().catch((err) => {
    console.error(err.message || err)
    process.exit(1)
})
