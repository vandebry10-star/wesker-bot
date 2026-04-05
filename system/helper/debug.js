/* ════════════════════════════════════════════
 * Wesker-MD  ╌  febry wesker
 * ════════════════════════════════════════════
 * file    : system/helper/debug.js
 * desc    : system › helper › debug
 * author  : febry  ⪩  2026
 * ════════════════════════════════════════════
 * © 2026 febry wesker. all rights reserved.
 * do not resell, redistribute, or claim as
 * your own work without explicit permission.
 * ────────────────────────────────────────────
 * © 2026 febry wesker. semua hak dilindungi.
 * dilarang menjual, menyebarkan, atau mengaku
 * sebagai karya sendiri tanpa izin tertulis.
 * ════════════════════════════════════════════ */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const CACHE_DIR = path.join(__dirname, 'cache')
const DEBUG_FILE = path.join(CACHE_DIR, 'debug.json')

function ensure() {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true })
  }

  if (!fs.existsSync(DEBUG_FILE)) {
    fs.writeFileSync(
      DEBUG_FILE,
      JSON.stringify({ enabled: false }, null, 2)
    )
  }
}

function read() {
  ensure()
  try {
    return JSON.parse(fs.readFileSync(DEBUG_FILE, 'utf8'))
  } catch {
    fs.writeFileSync(
      DEBUG_FILE,
      JSON.stringify({ enabled: false }, null, 2)
    )
    return { enabled: false }
  }
}

function write(data) {
  ensure()
  fs.writeFileSync(
    DEBUG_FILE,
    JSON.stringify(data, null, 2)
  )
}

export function isDebug() {
  return read().enabled === true
}

export function setDebug(state) {
  write({ enabled: Boolean(state) })
}

export function debugLog(...args) {
  if (!isDebug()) return
  console.log('[DEBUG]', ...args)
}
