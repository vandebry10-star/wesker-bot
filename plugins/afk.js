/* ════════════════════════════════════════════
 * Wesker-MD  ╌  febry wesker
 * ════════════════════════════════════════════
 * file    : plugins/afk.js
 * desc    : plugins › afk
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

import { setAFK, isAFK } from '../system/helper/afk-store.js'

export default {
  name: 'afk',
  command: ['afk'],
  category: ['user'],
  description: 'away from keyboard with summary',

  async run({ m }) {
    const sender = m.sender
    const chat = m.chat

    if (isAFK(sender)) {
      return m.reply('lah bukannya udah?')
    }

    const reason = m.text
      ?.trim()
      ?.replace(/^afk\s*/i, '')
      ?.trim() || '-'

    setAFK(sender, reason, chat)

    await m.reply(
      `afk aktif\n` +
      `alasan: ${reason}\n` +
      `> titip gorengan :v`
    )
  }
}
