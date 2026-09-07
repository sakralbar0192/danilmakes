import { Router } from 'express'

export const xlsxRouter = Router()

type Stage = {
    id: string
    label: string
    memoryMb: number
}

function buildStages(days: number, mode: 'stream' | 'naive'): Stage[] {
    if (mode === 'naive') {
        return [
            { id: 'load', label: 'Load full prices matrix', memoryMb: Math.round(days * 0.08) },
            { id: 'celldto', label: 'Build CellDto grid', memoryMb: Math.round(days * 0.22) },
            { id: 'write', label: 'Write workbook', memoryMb: Math.round(days * 0.25) },
            { id: 'peak', label: 'Peak retained', memoryMb: Math.round(days * 0.25) },
        ]
    }

    return [
        { id: 'window', label: 'Fetch prices window', memoryMb: 12 },
        { id: 'dayVector', label: 'Build dayVector', memoryMb: 8 },
        { id: 'write', label: 'Sparse write column', memoryMb: 10 },
        { id: 'discard', label: 'Discard dayVector', memoryMb: 6 },
        { id: 'peak', label: 'Peak retained', memoryMb: 14 },
    ]
}

/** Minimal XLSX (shared strings + one sheet) without heavy deps */
function buildSimpleXlsx(rows: string[][]): Buffer {
    const sheetRows = rows.map((cols, rowIndex) => {
        const cells = cols.map((value, colIndex) => {
            const col = String.fromCharCode(65 + colIndex)
            const ref = `${col}${rowIndex + 1}`
            const escaped = value
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
            return `<c r="${ref}" t="inlineStr"><is><t>${escaped}</t></is></c>`
        }).join('')
        return `<row r="${rowIndex + 1}">${cells}</row>`
    }).join('')

    const sheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>${sheetRows}</sheetData>
</worksheet>`

    const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`

    const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`

    const workbook = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Prices" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`

    const workbookRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>`

    // Store as uncompressed ZIP-like via simple concatenation is invalid;
    // use a minimal store-method zip builder.
    return zipStore({
        '[Content_Types].xml': contentTypes,
        '_rels/.rels': rels,
        'xl/workbook.xml': workbook,
        'xl/_rels/workbook.xml.rels': workbookRels,
        'xl/worksheets/sheet1.xml': sheet,
    })
}

function crc32(buf: Buffer): number {
    let crc = 0xffffffff
    for (let i = 0; i < buf.length; i += 1) {
        crc ^= buf[i]
        for (let j = 0; j < 8; j += 1) {
            const mask = -(crc & 1)
            crc = (crc >>> 1) ^ (0xedb88320 & mask)
        }
    }
    return (crc ^ 0xffffffff) >>> 0
}

function zipStore(files: Record<string, string>): Buffer {
    const chunks: Buffer[] = []
    const central: Buffer[] = []
    let offset = 0

    for (const [name, content] of Object.entries(files)) {
        const nameBuf = Buffer.from(name, 'utf-8')
        const data = Buffer.from(content, 'utf-8')
        const crc = crc32(data)
        const local = Buffer.alloc(30 + nameBuf.length)
        local.writeUInt32LE(0x04034b50, 0)
        local.writeUInt16LE(20, 4)
        local.writeUInt16LE(0, 6)
        local.writeUInt16LE(0, 8)
        local.writeUInt16LE(0, 10)
        local.writeUInt16LE(0, 12)
        local.writeUInt32LE(crc, 14)
        local.writeUInt32LE(data.length, 18)
        local.writeUInt32LE(data.length, 22)
        local.writeUInt16LE(nameBuf.length, 26)
        local.writeUInt16LE(0, 28)
        nameBuf.copy(local, 30)

        const centralHeader = Buffer.alloc(46 + nameBuf.length)
        centralHeader.writeUInt32LE(0x02014b50, 0)
        centralHeader.writeUInt16LE(20, 4)
        centralHeader.writeUInt16LE(20, 6)
        centralHeader.writeUInt16LE(0, 8)
        centralHeader.writeUInt16LE(0, 10)
        centralHeader.writeUInt16LE(0, 12)
        centralHeader.writeUInt16LE(0, 14)
        centralHeader.writeUInt32LE(crc, 16)
        centralHeader.writeUInt32LE(data.length, 20)
        centralHeader.writeUInt32LE(data.length, 24)
        centralHeader.writeUInt16LE(nameBuf.length, 28)
        centralHeader.writeUInt16LE(0, 30)
        centralHeader.writeUInt16LE(0, 32)
        centralHeader.writeUInt16LE(0, 34)
        centralHeader.writeUInt16LE(0, 36)
        centralHeader.writeUInt32LE(0, 38)
        centralHeader.writeUInt32LE(offset, 42)
        nameBuf.copy(centralHeader, 46)

        chunks.push(local, data)
        central.push(centralHeader)
        offset += local.length + data.length
    }

    const centralDir = Buffer.concat(central)
    const end = Buffer.alloc(22)
    end.writeUInt32LE(0x06054b50, 0)
    end.writeUInt16LE(0, 4)
    end.writeUInt16LE(0, 6)
    end.writeUInt16LE(Object.keys(files).length, 8)
    end.writeUInt16LE(Object.keys(files).length, 10)
    end.writeUInt32LE(centralDir.length, 12)
    end.writeUInt32LE(offset, 16)
    end.writeUInt16LE(0, 20)

    return Buffer.concat([...chunks, centralDir, end])
}

xlsxRouter.get('/pipeline', (req, res) => {
    const days = Math.min(Math.max(Number(req.query.days ?? 365), 30), 730)
    res.json({
        days,
        stream: buildStages(days, 'stream'),
        naive: buildStages(days, 'naive'),
        note: 'Demo mirrors PHP StreamingExporter idea: window → dayVector → write → discard.',
    })
})

xlsxRouter.post('/export', (req, res) => {
    const days = Math.min(Math.max(Number(req.body?.days ?? 90), 7), 365)
    const roomtypes = ['Стандарт', 'Комфорт', 'Люкс']
    const rows: string[][] = [['Date', ...roomtypes]]

    const start = new Date()
    for (let i = 0; i < days; i += 1) {
        const d = new Date(start)
        d.setDate(start.getDate() + i)
        rows.push([
            d.toISOString().slice(0, 10),
            ...roomtypes.map((_, idx) => String(3000 + i * 3 + idx * 120)),
        ])
    }

    const stages = buildStages(days, 'stream')
    const file = buildSimpleXlsx(rows)
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename="tariff-prices-demo.xlsx"`)
    res.setHeader('X-Demo-Pipeline', JSON.stringify(stages))
    res.send(file)
})
