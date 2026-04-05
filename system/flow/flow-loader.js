/* ════════════════════════════════════════════
 * Wesker-MD  ╌  febry wesker
 * ════════════════════════════════════════════
 * file    : system/flow/flow-loader.js
 * desc    : system › flow › flow-loader
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
import { registerFlow } from './flow-manager.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FLOWS_DIR  = path.resolve(__dirname, '../flows')

export async function loadFlows() {
  if (!fs.existsSync(FLOWS_DIR)) {
    fs.mkdirSync(FLOWS_DIR, { recursive: true })
    console.log('[FLOW] created flows/ directory')
    return
  }

  const files = fs.readdirSync(FLOWS_DIR).filter(f => f.endsWith('.js'))

  for (const file of files) {
    try {
      const mod = await import(`file://${path.join(FLOWS_DIR, file)}?t=${Date.now()}`)
      registerFlow(mod.default)
    } catch (e) {
      console.error(`[FLOW] failed to load ${file}:`, e.message)
    }
  }

  console.log(`[FLOW] ${files.length} flow(s) loaded`)
}
