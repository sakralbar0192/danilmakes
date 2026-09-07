const ROOMTYPES = [
    { id: '101', name: 'Стандарт' },
    { id: '102', name: 'Комфорт' },
    { id: '103', name: 'Люкс' },
]

function seededValue(seed: number) {
    const x = Math.sin(seed) * 10000
    return x - Math.floor(x)
}

function metricForDay(dayIndex: number, kind: string) {
    const base = seededValue(dayIndex * 17 + kind.length * 3)
    if (kind === 'load') return Math.round(45 + base * 50)
    if (kind === 'adr') return Math.round(3500 + base * 2500)
    if (kind === 'revpar') return Math.round(1800 + base * 2200)
    return Math.round(40000 + base * 80000)
}

function buildDateRange(from: string, to: string) {
    const dates: string[] = []
    const start = new Date(from)
    const end = new Date(to)
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return dates
    const cursor = new Date(start)
    while (cursor <= end) {
        dates.push(cursor.toISOString().slice(0, 10))
        cursor.setDate(cursor.getDate() + 1)
    }
    return dates
}

export function buildRevenuePlanResponse() {
    const year = new Date().getFullYear()
    const months: Record<number, Record<string, number>> = {}
    for (let m = 1; m <= 12; m += 1) {
        months[m] = {
            revenue: 900000 + m * 45000,
            adr: 4200 + m * 40,
            load: 60 + (m % 4) * 5,
            revpar: 2800 + m * 35,
        }
    }
    return {
        result: 'success',
        data: {
            yearsData: { [year]: months },
            categories: [],
        },
    }
}

export function buildRevenueReportResponse(payload: Record<string, any> = {}) {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    const from = payload?.primary?.from || monthStart.toISOString().slice(0, 10)
    const to = payload?.primary?.to || monthEnd.toISOString().slice(0, 10)
    const roomtypeIds = (payload?.primary?.roomtypes_ids?.length
        ? payload.primary.roomtypes_ids
        : ROOMTYPES.map(r => r.id)) as string[]
    const roomtypes = ROOMTYPES.filter(r => roomtypeIds.includes(r.id))
    const dates = buildDateRange(from, to)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tableDates: Record<string, unknown> = {}
    const revenueDates: Record<string, number> = {}
    const adrDates: Record<string, number> = {}
    const revparDates: Record<string, number> = {}
    const loadDates: Record<string, number> = {}

    dates.forEach((date, dayIndex) => {
        const rows = roomtypes.map(rt => {
            const seed = dayIndex * 100 + Number(rt.id)
            return {
                id: rt.id,
                name: rt.name,
                income: metricForDay(seed, 'income'),
                adr: metricForDay(seed, 'adr'),
                revpar: metricForDay(seed, 'revpar'),
                load: metricForDay(seed, 'load'),
                rooms: Math.round(8 + seededValue(seed) * 12),
            }
        })
        const income = rows.reduce((s, r) => s + r.income, 0)
        const adr = Math.round(rows.reduce((s, r) => s + r.adr, 0) / Math.max(rows.length, 1))
        const revpar = Math.round(rows.reduce((s, r) => s + r.revpar, 0) / Math.max(rows.length, 1))
        const load = Math.round(rows.reduce((s, r) => s + r.load, 0) / Math.max(rows.length, 1))
        tableDates[date] = { roomtypes: rows, income, adr, revpar, load }
        revenueDates[date] = income
        adrDates[date] = adr
        revparDates[date] = revpar
        loadDates[date] = load
    })

    const incomeTotal = Object.values(revenueDates).reduce((s, v) => s + v, 0)
    const adrAvg = Math.round(Object.values(adrDates).reduce((s, v) => s + v, 0) / Math.max(dates.length, 1))
    const revparAvg = Math.round(Object.values(revparDates).reduce((s, v) => s + v, 0) / Math.max(dates.length, 1))
    const loadAvg = Math.round(Object.values(loadDates).reduce((s, v) => s + v, 0) / Math.max(dates.length, 1))

    return {
        result: 'success',
        data: {
            result: {
                primary: {
                    metrics: {
                        income: incomeTotal,
                        adr: adrAvg,
                        revpar: revparAvg,
                        load: loadAvg,
                    },
                    table: { dates: tableDates },
                    revenue: { dates: revenueDates },
                    adr: { dates: adrDates },
                    revpar: { dates: revparDates },
                    load: { dates: loadDates },
                },
            },
        },
    }
}

export const hotelFixture = {
    hotel: {
        id: 1,
        name: 'Demo Hotel',
        currency: 'RUB',
    },
}

export const roomTypesFixture = {
    roomtypes: ROOMTYPES.map(r => ({
        id: Number(r.id),
        name: r.name,
        rooms: [{ id: Number(r.id) * 10 }],
    })),
}
