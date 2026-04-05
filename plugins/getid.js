/* ════════════════════════════════════════════
 * Wesker-MD  ╌  febry wesker
 * file    : plugins/getid.js
 * ════════════════════════════════════════════ */

export default {
  name    : 'getid',
  command : ['getid', 'gid', 'jid'],
  category: ['info'],
  description: 'cek JID sender / grup',

  async run({ m }) {
    const out =
      `⟡ sender ╌ ${m.sender}\n` +
      `⟡ chat   ╌ ${m.chat}\n` +
      (m.quoted ? `⟡ quoted ╌ ${m.quoted.raw?.key?.participant || '-'}` : '')
    return m.reply(out.trim())
  }
}
