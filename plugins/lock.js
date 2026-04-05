/* ════════════════════════════════════════════
 * Wesker-MD  ╌  febry wesker
 * ════════════════════════════════════════════
 * file    : plugins/lock.js
 * desc    : plugins › lock
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

import { isLocked, lockBot, unlockBot } from '../system/helper/lock.js'
import { weskerSend } from '../system/helper/wesker-message.js'

export default {
  name: 'lock',
  command: ['lock', 'unlock'],
  category: ['dev'],
  description: 'kunci / buka respon bot global',

  async run(ctx) {
    const { feb, m, command } = ctx

    if (command === 'lock') {
      if (isLocked()) {
        return weskerSend(
          feb,
          m.chat,
          'udah lock',
          { quoted: m }
        )
      }

      lockBot()

      return weskerSend(
        feb,
        m.chat,
        'successfully locked bot 🔒',
        { quoted: m }
      )
    }

    if (command === 'unlock') {
      if (!isLocked()) {
        return weskerSend(
          feb,
          m.chat,
          'lah lagi gak lock jir',
          { quoted: m }
        )
      }

      unlockBot()

      return weskerSend(
        feb,
        m.chat,
        'successfully unlocked bot 🔓',
        { quoted: m }
      )
    }
  }
}