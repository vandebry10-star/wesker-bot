/* ════════════════════════════════════════════
 * Wesker-MD  ╌  febry wesker
 * ════════════════════════════════════════════
 * file    : system/flow/session-store.js
 * desc    : system › flow › session-store
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

const sessions = new Map()

export function sessionKey(sender, chat) {
  return `${sender}::${chat}`
}

export function getSession(sender, chat) {
  return sessions.get(sessionKey(sender, chat)) ?? null
}

export function setSession(sender, chat, data) {
  sessions.set(sessionKey(sender, chat), data)
}

export function deleteSession(sender, chat) {
  const key = sessionKey(sender, chat)
  const s = sessions.get(key)
  if (s) {
    clearTimeout(s._timeout)
    clearTimeout(s._confirm)
  }
  sessions.delete(key)
}

export function hasSession(sender, chat) {
  return sessions.has(sessionKey(sender, chat))
}

export function getAllSessions() {
  return [...sessions.entries()]
}
