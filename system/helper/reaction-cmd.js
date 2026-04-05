/* ════════════════════════════════════════════
 * Wesker-MD  ╌  febry wesker
 * ════════════════════════════════════════════
 * file    : system/helper/reaction-cmd.js
 * desc    : system › helper › reaction-cmd
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

import path from 'node:path'
import { fileURLToPath } from 'url'
import { ConfigCache } from './config-cache.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const RCMD_FILE = path.join(__dirname, '../cache/reaction-cmd.json')

const cache = new ConfigCache(RCMD_FILE, {})

export function getReactionCmdDB() {
  return cache.get()
}

export function addReactionCmd(emoji, cmd) {
  if (!emoji || !cmd) return
  const db = cache.get()
  db[emoji] = cmd
  cache.set(db)
}

export function removeReactionCmd(emoji) {
  if (!emoji) return
  const db = cache.get()
  delete db[emoji]
  cache.set(db)
}

export function setReactionCmdDB(data) {
  cache.set(data)
}

export function getReactionCmd(emoji) {
  if (!emoji) return null
  return cache.get()[emoji] || null
}

