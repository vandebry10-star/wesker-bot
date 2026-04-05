/* ════════════════════════════════════════════
 * Wesker-MD  ╌  febry wesker
 * ════════════════════════════════════════════
 * file    : system/helper/access.js
 * desc    : system › helper › access
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
const ACCESS_FILE = path.join(__dirname, '../cache/access.json')

const cache = new ConfigCache(ACCESS_FILE, {})

function extractNumber(jid) {
  if (!jid) return null
  return jid.replace(/:\d+/, '').split('@')[0]
}

export function getRole(jid) {
  if (!jid) return null
  const db = cache.get()

  if (db[jid]) return db[jid]

  const num = extractNumber(jid)
  if (!num) return null

  for (const [key, role] of Object.entries(db)) {
    if (extractNumber(key) === num) return role
  }

  return null
}

export function addUser(jid, role) {
  if (!jid || !['dev', 'user'].includes(role)) return
  const db = cache.get()
  db[jid] = role
  cache.set(db)
}

export function removeUser(jid) {
  if (!jid) return
  const db = cache.get()

  if (db[jid]) {
    delete db[jid]
    cache.set(db)
    return
  }

  const num = extractNumber(jid)
  if (!num) return
  let changed = false
  for (const key of Object.keys(db)) {
    if (extractNumber(key) === num) {
      delete db[key]
      changed = true
    }
  }
  if (changed) cache.set(db)
}

export function listAccess() {
  return cache.get()
}