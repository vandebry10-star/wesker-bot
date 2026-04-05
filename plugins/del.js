/* ════════════════════════════════════════════
 * Wesker-MD  ╌  febry wesker
 * file    : plugins/del.js
 * ════════════════════════════════════════════ */

export default {
  name    : 'del',
  command : ['del', 'delete'],
  category: ['tools'],
  description: 'hapus pesan bot\nreply pesan bot + del',

  async run({ feb, m, chat }) {
    const q = m.quoted?.raw
    if (!q) return m.reply('reply pesan yang mau dihapus')
    const isBotMsg = q.key?.fromMe === true
    if (!isBotMsg) return m.reply('hanya bisa hapus pesan bot')
    await feb.sendMessage(chat, { delete: q.key })
  }
}
