/* ════════════════════════════════════════════
 * Wesker-MD  ╌  febry wesker
 * ════════════════════════════════════════════
 * file    : plugins/debug.js
 * desc    : plugins › debug
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

import { isDebug, setDebug } from '../system/helper/debug.js'
import { weskerSend } from '../system/helper/wesker-message.js'

export default {
  name: 'debug',
  command: ['debug'],
  category: ['dev'],
  description: 'toggle debug log runtime',

  async run(ctx) {
    const { feb, m, args } = ctx
    const sub = args[0]

    if (!sub || sub === 'status') {
      return weskerSend(
        feb,
        m.chat,
        `debug status: *${isDebug() ? 'idup' : 'mati'}*`,
        { quoted: m }
      )
    }

    if (sub === 'on') {
      setDebug(true)
      return weskerSend(
        feb,
        m.chat,
        'debug on',
        { quoted: m }
      )
    }

    if (sub === 'off') {
      setDebug(false)
      return weskerSend(
        feb,
        m.chat,
        '> debug off',
        { quoted: m }
      )
    }

    return weskerSend(
      feb,
      m.chat,
`use
debug
debug status
debug on
debug off

note:
• ga perlu restart`,
      { quoted: m }
    )
  }
}
