/* ════════════════════════════════════════════
 * Wesker-MD  ╌  febry wesker
 * ════════════════════════════════════════════
 * file    : plugins/runtime.js
 * desc    : plugins › runtime
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

function formatRuntime(seconds) {
  seconds = Math.floor(seconds)

  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60

  return `${d}d ${h}h ${m}m ${s}s`
}

export default {
  name: 'runtime',
  command: ['runtime', 'rt'],
  category: ['info'],
  description: 'cek runtime bot (d h m s)',

  async run({ m }) {
    const uptime = process.uptime()
    const formatted = formatRuntime(uptime)

    return m.reply(formatted)
  }
}