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

import { formatSeconds } from '../system/helper/index.js'

export default {
  name: 'runtime',
  command: ['runtime', 'rt'],
  category: ['info'],
  description: 'cek runtime bot (d h m s)',

  async run({ m }) {
    const uptime = process.uptime()
    const formatted = formatSeconds(uptime)

    return m.reply(formatted)
  }
}
