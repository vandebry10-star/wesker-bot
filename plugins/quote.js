/* ════════════════════════════════════════════
 * Wesker-MD  ╌  febry wesker
 * file    : plugins/quote.js
 * ════════════════════════════════════════════ */

export default {
  name    : 'quote',
  command : ['quote', 'q'],
  category: ['tools'],
  description: 'forward pesan sebagai quote\nreply pesan + quote',

  async run({ feb, m, chat }) {
    const q = m.quoted?.raw
    if (!q) return m.reply('reply pesan dulu')
    await feb.relayMessage(chat, q.message, {})
  }
}
