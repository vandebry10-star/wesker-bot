/* ════════════════════════════════════════════
 * Wesker-MD  ╌  febry wesker
 * ════════════════════════════════════════════
 * file    : plugins/access.js
 * desc    : plugins › access
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


import {
  addUser,
  removeUser,
  listAccess
} from '../system/helper/access.js'

import { jidNormalizedUser } from 'baileys'

function normalizeJid(raw) {
  if (!raw) return null
  raw = raw.trim()

  if (raw.startsWith('@')) raw = raw.slice(1)
  if (!raw.includes('@')) raw += '@lid'

  return jidNormalizedUser(raw)
}

function getTarget(m, args) {
  if (m.mentions?.length) return m.mentions[0]
  if (m.quoted?.sender) return m.quoted.sender
  if (args[1]) return normalizeJid(args[1])
  return null
}

export default {
  name: 'access',
  command: ['access'],
  category: ['owner'],
  hidden: false,

  async run({ m, args }) {

    const action = args[0]
    const data   = listAccess()
    const entries = Object.keys(data)

    /* ─ LIST ─ */
    if (!action) {

  if (!entries.length)
    return m.reply('belum ada user')

  let text = '*list akses*\n\n'

  entries.forEach((jid, i) => {
    text += `${i + 1}. ${jid.split('@')[0]}\n`
    text += `   role: ${data[jid]}${i === 0 ? ' (ini nomor bot)' : ''}\n\n`
  })

  text += `> reply/tag target lalu ketik *access owner/user* untuk memberikan role\n`
  text += `> role *owner* dapat mengakses semua kategori, role *user* tidak dapat mengakses kategori owner`

  return m.reply(text.trim())
    }
    
    /* ─ TARGET ─ */
    const target = getTarget(m, args)

    if (!target)
      return m.reply('tag / reply / nomor')

    /* ─ DEV ─ */
    if (action === 'owner') {
      addUser(target, 'owner')
      return m.reply(`berhasil set owner\n${target}`)
    }

    /* ─ USER ─ */
    if (action === 'user') {
      addUser(target, 'user')
      return m.reply(`berhasil set user\n${target}`)
    }

    /* ─ DELETE ─ */
    if (action === 'del') {

      if (entries[0] === target)
        return m.reply('owner tidak bisa dihapus')

      removeUser(target)
      return m.reply(`berhasil hapus\n${target}`)
    }

    return m.reply('action tidak dikenal')
  }
}
