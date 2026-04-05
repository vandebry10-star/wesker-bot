/* ════════════════════════════════════════════
 * Wesker-MD  ╌  febry wesker
 * ════════════════════════════════════════════
 * file    : system/helper/afk-store.js
 * desc    : system › helper › afk-store
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

const store = new Map()

export function setAFK(jid, reason = '-', chat = null) {
  store.set(jid, {
    reason,
    chat,
    since: Date.now()
  })
}

export function isAFK(jid) {
  return store.has(jid)
}

export function getAFK(jid) {
  return store.get(jid) || null
}

export function clearAFK(jid) {
  store.delete(jid)
}

export function getAllAFK() {
  return [...store.entries()].map(([jid, data]) => ({ jid, ...data }))
}

