/* ════════════════════════════════════════════
 * Wesker-MD  ╌  febry wesker
 * ════════════════════════════════════════════
 * file    : system/helper/util.js
 * desc    : system › helper › util
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

export function extractCommand(text, prefixes) {
  
  if (typeof text !== 'string') return null

  for (const prefix of prefixes) {
    if (text.startsWith(prefix)) {
      const withoutPrefix = text.slice(prefix.length).trim()
      if (!withoutPrefix) return null

      const parts = withoutPrefix.split(/\s+/)

      return {
        command: parts[0].toLowerCase(),
        args: parts.slice(1),
        prefix,
        text: withoutPrefix 
      }
    }
  }
  return null
}
