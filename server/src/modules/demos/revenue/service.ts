function localYmd(date: Date) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}

function parseLocalYmd(value: string) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ''))
    if (!match) return null
    const year = Number(match[1])
    const month = Number(match[2]) - 1
    const day = Number(match[3])
    const date = new Date(year, month, day)
    if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
        return null
    }
    return date
}

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
    const start = parseLocalYmd(from)
    const end = parseLocalYmd(to)
    if (!start || !end) return dates
    const cursor = new Date(start)
    while (cursor <= end) {
        dates.push(localYmd(cursor))
        cursor.setDate(cursor.getDate() + 1)
    }
    return dates
}

function buildRoomtypeRow(dayIndex: number, roomtype: { id: string; name: string }) {
    const seed = dayIndex * 100 + Number(roomtype.id)
    return {
        id: roomtype.id,
        name: roomtype.name,
        income: metricForDay(seed, 'income'),
        adr: metricForDay(seed, 'adr'),
        revpar: metricForDay(seed, 'revpar'),
        load: metricForDay(seed, 'load'),
        rooms: Math.round(8 + seededValue(seed) * 12),
    }
}

type MetricRow = {
    id?: string
    name?: string
    income: number
    adr: number
    revpar: number
    load: number
    rooms: number
}

function sumRows(rows: MetricRow[], key: keyof MetricRow) {
    if (key === 'load') {
        const totalRooms = rows.reduce((s, r) => s + (r.rooms || 0), 0)
        const weighted = rows.reduce((s, r) => s + (r.load || 0) * (r.rooms || 0), 0)
        return totalRooms ? Math.round(weighted / totalRooms) : 0
    }
    if (key === 'adr' || key === 'revpar') {
        const totalIncome = rows.reduce((s, r) => s + (r.income || 0), 0)
        const weighted = rows.reduce((s, r) => s + ((r[key] as number) || 0) * (r.income || 0), 0)
        return totalIncome ? Math.round(weighted / totalIncome) : 0
    }
    return rows.reduce((s, r) => s + ((r[key] as number) || 0), 0)
}

function normalizeRoomtypeIds(ids: unknown): string[] {
    if (!Array.isArray(ids) || ids.length === 0) {
        return ROOMTYPES.map(r => r.id)
    }
    return ids.map(id => String(id))
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
    const from = payload?.primary?.from || localYmd(monthStart)
    const to = payload?.primary?.to || localYmd(monthEnd)
    const roomtypeIds = normalizeRoomtypeIds(payload?.primary?.roomtypes_ids)
    const roomtypes = ROOMTYPES.filter(r => roomtypeIds.includes(r.id))
    const dates = buildDateRange(from, to)
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const tableDates: Record<string, any> = {}
    const revenueDates: Record<string, number> = {}
    const adrDates: Record<string, number> = {}
    const revparDates: Record<string, number> = {}
    const loadDates: Record<string, number> = {}
    const pastAgg: Record<string, MetricRow & { count: number }> = {}
    const futureAgg: Record<string, MetricRow & { count: number }> = {}

    dates.forEach((date, dayIndex) => {
        const dayRows: Record<string, MetricRow> = {}
        roomtypes.forEach(rt => {
            dayRows[rt.id] = buildRoomtypeRow(dayIndex, rt)
        })
        const rowList = Object.values(dayRows)
        dayRows.selected = {
            id: 'selected',
            name: 'Итого',
            income: sumRows(rowList, 'income'),
            adr: sumRows(rowList, 'adr'),
            revpar: sumRows(rowList, 'revpar'),
            load: sumRows(rowList, 'load'),
            rooms: sumRows(rowList, 'rooms'),
        }

        tableDates[date] = dayRows
        revenueDates[date] = dayRows.selected.income
        adrDates[date] = dayRows.selected.adr
        revparDates[date] = dayRows.selected.revpar
        loadDates[date] = dayRows.selected.load

        const dateObj = parseLocalYmd(date)!
        const bucket = dateObj < today ? pastAgg : futureAgg
        roomtypes.forEach(rt => {
            if (!bucket[rt.id]) {
                bucket[rt.id] = {
                    income: 0, adr: 0, revpar: 0, load: 0, rooms: 0, count: 0,
                }
            }
            const row = dayRows[rt.id]
            bucket[rt.id].income += row.income
            bucket[rt.id].adr += row.adr
            bucket[rt.id].revpar += row.revpar
            bucket[rt.id].load += row.load
            bucket[rt.id].rooms += row.rooms
            bucket[rt.id].count += 1
        })
    })

    const finalizeBucket = (bucket: Record<string, MetricRow & { count: number }>) => {
        const result: Record<string, MetricRow> = {}
        roomtypes.forEach(rt => {
            const b = bucket[rt.id]
            if (!b) return
            result[rt.id] = {
                income: b.income,
                adr: Math.round(b.adr / b.count),
                revpar: Math.round(b.revpar / b.count),
                load: Math.round(b.load / b.count),
                rooms: b.rooms,
            }
        })
        const rows = Object.values(result)
        result.selected = {
            income: sumRows(rows, 'income'),
            adr: sumRows(rows, 'adr'),
            revpar: sumRows(rows, 'revpar'),
            load: sumRows(rows, 'load'),
            rooms: sumRows(rows, 'rooms'),
        }
        return result
    }

    tableDates.past = finalizeBucket(pastAgg)
    tableDates.future = finalizeBucket(futureAgg)

    const total: Record<string, MetricRow> = {}
    roomtypes.forEach(rt => {
        const rows = dates.map(d => tableDates[d]?.[rt.id]).filter(Boolean) as MetricRow[]
        total[rt.id] = {
            id: rt.id,
            name: rt.name,
            income: sumRows(rows, 'income'),
            adr: sumRows(rows, 'adr'),
            revpar: sumRows(rows, 'revpar'),
            load: sumRows(rows, 'load'),
            rooms: sumRows(rows, 'rooms'),
        }
    })
    const totalRows = roomtypes.map(rt => total[rt.id])
    total.selected = {
        id: 'selected',
        name: 'Итого',
        income: sumRows(totalRows, 'income'),
        adr: sumRows(totalRows, 'adr'),
        revpar: sumRows(totalRows, 'revpar'),
        load: sumRows(totalRows, 'load'),
        rooms: sumRows(totalRows, 'rooms'),
    }

    const metricsSelected = total.selected
    const pastRows = Object.values(tableDates.past || {}) as MetricRow[]
    const futureRows = (Object.values(tableDates.future || {}) as MetricRow[])
        .filter(r => r.income !== undefined)

    return {
        result: 'success',
        data: {
            result: {
                primary: {
                    metrics: {
                        selected: {
                            income: metricsSelected.income,
                            adr: metricsSelected.adr,
                            revpar: metricsSelected.revpar,
                            load: metricsSelected.load,
                        },
                        past: {
                            income: sumRows(pastRows, 'income'),
                            adr: sumRows(pastRows, 'adr'),
                            revpar: sumRows(pastRows, 'revpar'),
                            load: sumRows(pastRows, 'load'),
                        },
                        future: {
                            income: sumRows(futureRows, 'income'),
                            adr: sumRows(futureRows, 'adr'),
                            revpar: sumRows(futureRows, 'revpar'),
                            load: sumRows(futureRows, 'load'),
                        },
                    },
                    table: {
                        dates: tableDates,
                        total,
                    },
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

/** Shape aligned with demos/report-revenue MSW fixture (string ids + rooms + extra). */
export const roomTypesFixture = {
    roomtypes: [
        {
            id: '101',
            hotel_id: '10001',
            parent_id: '0',
            name: 'Стандарт',
            type: '1',
            adults: '2',
            children: '0',
            extra: { excluded: false, exclude_for_report: false },
            subrooms: [],
            rooms: [
                { id: '1001', hotel_id: '10001', room_type_id: '101', name: '101', sort_order: '0' },
                { id: '1002', hotel_id: '10001', room_type_id: '101', name: '102', sort_order: '1' },
                { id: '1003', hotel_id: '10001', room_type_id: '101', name: '103', sort_order: '2' },
            ],
        },
        {
            id: '102',
            hotel_id: '10001',
            parent_id: '0',
            name: 'Комфорт',
            type: '1',
            adults: '2',
            children: '0',
            extra: { excluded: false, exclude_for_report: false },
            subrooms: [],
            rooms: [
                { id: '2001', hotel_id: '10001', room_type_id: '102', name: '201', sort_order: '0' },
                { id: '2002', hotel_id: '10001', room_type_id: '102', name: '202', sort_order: '1' },
            ],
        },
        {
            id: '103',
            hotel_id: '10001',
            parent_id: '0',
            name: 'Люкс',
            type: '1',
            adults: '2',
            children: '0',
            extra: { excluded: false, exclude_for_report: false },
            subrooms: [],
            rooms: [
                { id: '3001', hotel_id: '10001', room_type_id: '103', name: '301', sort_order: '0' },
            ],
        },
    ],
}
