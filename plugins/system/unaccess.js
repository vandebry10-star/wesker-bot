/* ════════════════════════════════════════════
 * Wesker-MD  ╌  febry wesker
 * file    : plugins/system/unaccess.js
 * desc    : plugins › unaccess
 * author  : febry  ⪩  2026
 * ════════════════════════════════════════════ */

import { getRole, removeUser } from '../../system/helper/access.js'

export default {
  name: 'unaccess',
  command: ['unaccess'],
  category: ['user'],
  description: 'lepas akses bot (hapus diri sendiri)',

  async run({ m, args }) {
    if (args[0] !== 'me')
      return m.sendText('usage: *unaccess me*')

    const jid  = m.sender
    const role = getRole(jid)

    if (!role)
      return m.sendText('kamu memang belum terdaftar')

    if (role === 'owner')
      return m.sendText('❌ owner tidak bisa unaccess diri sendiri')

    removeUser(jid)
    return m.sendText(`akses kamu telah dilepas.\n\nbot sekarang akan mengabaikan pesan dari kamu.`)
  }
}
