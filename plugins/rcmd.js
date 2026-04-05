/* ════════════════════════════════════════════
 * Wesker-MD  ╌  febry wesker
 * ════════════════════════════════════════════
 * file    : plugins/rcmd.js
 * desc    : plugins › rcmd
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
  getReactionCmdDB,
  addReactionCmd,
  removeReactionCmd,
  setReactionCmdDB
} from '../system/helper/reaction-cmd.js'

export default {
  name: 'rcmd',
  command: ['rcmd'],
  category: ['owner'],
  description: 'reaction command manager',

  async run({ m, args }) {
    const db = getReactionCmdDB()

    if (!args.length) {
      const count = Object.keys(db).length

      return m.reply(
        `*REACTION COMMAND MANAGER*\n\n` +
        `Total registered: ${count}\n\n` +
        `*Usage:*\n` +
        `• rcmd add 🥀 reload\n` +
        `• rcmd del 🥀\n` +
        `• rcmd list\n` +
        `• rcmd clear\n\n` +
        `*How it works:*\n` +
        `1. Set: rcmd add 🍬 menu\n` +
        `2. React 🍬 ke pesan\n` +
        `3. Bot execute 'menu' command\n` +
        `4. Target: pesan yang direact`
      )
    }

    const sub = args[0].toLowerCase()

    if (sub === 'add') {
      const emoji = args[1]
      const cmd = args.slice(2).join(' ')

      if (!emoji || !cmd) {
        return m.reply('Format salah!\n\nContoh: rcmd add 🥀 reload')
      }

      addReactionCmd(emoji, cmd)

      return m.reply(
        `*RCMD ADDED*\n\n` +
        `Emoji: ${emoji}\n` +
        `Command: ${cmd}\n\n` +
        `Test: React ${emoji} ke pesan apapun`
      )
    }

    if (sub === 'del' || sub === 'delete') {
      const emoji = args[1]
      if (!emoji) return m.reply('Emoji mana?\n\nContoh: rcmd del 🥀')

      if (!db[emoji]) {
        return m.reply(`Emoji ${emoji} belum terdaftar`)
      }

      const cmd = db[emoji]
      removeReactionCmd(emoji)

      return m.reply(`RCMD deleted\n\nEmoji: ${emoji}\nCommand: ${cmd}`)
    }

    if (sub === 'list') {
      const keys = Object.keys(db)

      if (!keys.length) {
        return m.reply('📭 Belum ada reaction command\n\nTambah dengan: rcmd add 🍬 menu')
      }

      let text = `*REACTION COMMAND LIST*\n\n`
      keys.forEach((k, i) => {
        text += `${i + 1}. ${k} → ${db[k]}\n`
      })
      text += `\nTotal: ${keys.length} command`

      return m.reply(text.trim())
    }

    if (sub === 'clear') {
      const count = Object.keys(db).length
      if (count === 0) {
        return m.reply('📭 Sudah kosong')
      }

      setReactionCmdDB({})

      return m.reply(`✅ ${count} reaction command dihapus`)
    }

    return m.reply(
      'Subcommand tidak dikenal\n\n' +
      'Gunakan: rcmd (tanpa args) untuk help'
    )
  }
}
