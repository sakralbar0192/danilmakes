#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const targets = [
    path.join(root, 'public/europe/img'),
    path.join(root, 'public/jevellery/img'),
]

const JPEG_QUALITY = 82
const WEBP_QUALITY = 75
const PNG_COMPRESSION = 9

let processed = 0
let savedBytes = 0

async function compressFile(filePath) {
    const before = fs.statSync(filePath).size
    const ext = path.extname(filePath).toLowerCase()

    let buffer
    if (ext === '.jpg' || ext === '.jpeg') {
        buffer = await sharp(filePath).jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer()
    } else if (ext === '.png') {
        buffer = await sharp(filePath).png({ compressionLevel: PNG_COMPRESSION, palette: true }).toBuffer()
    } else if (ext === '.webp') {
        buffer = await sharp(filePath).webp({ quality: WEBP_QUALITY }).toBuffer()
    } else {
        return
    }

    if (buffer.length < before) {
        fs.writeFileSync(filePath, buffer)
        savedBytes += before - buffer.length
    }

    processed += 1
}

async function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name)
        if (entry.isDirectory()) {
            await walk(fullPath)
        } else if (/\.(jpe?g|png|webp)$/i.test(entry.name)) {
            await compressFile(fullPath)
        }
    }
}

for (const target of targets) {
    if (!fs.existsSync(target)) {
        console.warn(`Skip missing: ${target}`)
        continue
    }
    console.log(`Compressing images in ${target}…`)
    await walk(target)
}

const savedMb = (savedBytes / 1024 / 1024).toFixed(2)
console.log(`Done. Processed ${processed} files, saved ${savedMb} MB.`)
