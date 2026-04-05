/* ════════════════════════════════════════════
 * Wesker-MD  ╌  febry wesker
 * ════════════════════════════════════════════
 * file    : plugins/unaccess.js
 * desc    : plugins › unaccess
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

import { getRole, removeUser } from '../system/helper/access.js'
import { weskerSend } from '../system/helper/wesker-message.js'

export default {
  name: 'unaccess',
  command: ['unaccess'],
  category: ['user'],
  description: 'lepas akses bot (hapus diri sendiri)',

  async run(ctx) {
    const { feb, m, args } = ctx

    if (args[0] !== 'me') {
      return weskerSend(
        feb,
        m.chat,
        'usage: *unaccess me*',
        { quoted: m }
      )
    }

    const jid = m.sender
    const role = getRole(jid)

    if (!role) {
      return weskerSend(
        feb,
        m.chat,
        'kamu memang belum terdaftar',
        { quoted: m }
      )
    }

    if (role === 'owner') {
      return weskerSend(
        feb,
        m.chat,
        '❌ owner tidak bisa unaccess diri sendiri',
        { quoted: m }
      )
    }

    removeUser(jid)

    return weskerSend(
      feb,
      m.chat,
      `akses kamu telah dilepas.\n\nbot sekarang akan mengabaikan pesan dari kamu.`,
      { quoted: m }
    )
  }
}