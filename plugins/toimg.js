/* ════════════════════════════════════════════
 * Wesker-MD  ╌  febry wesker
 * file    : plugins/toimg.js
 * ════════════════════════════════════════════ */

import sharp from 'sharp'
import { downloadContentFromMessage } from 'baileys'

async function dlBuffer(msg, type) {
  const stream = await downloadContentFromMessage(msg, type)
  const chunks = []
  for await (const chunk of stream) chunks.push(chunk)
  return Buffer.concat(chunks)
}

export default {
  name    : 'toimg',
  command : ['toimg', 'simg'],
  category: ['tools'],
  description: 'convert sticker ke gambar\nreply sticker + toimg',

  async run({ feb, m, chat, react }) {
    const q   = m.quoted?.raw?.message || m.raw?.message
    const msg = q?.stickerMessage
    if (!msg) return m.reply('reply sticker dulu')

    await react('⏳')
    const buf = await dlBuffer(msg, 'sticker')
    const img = await sharp(buf).png().toBuffer()
    await feb.sendMessage(chat, { image: img }, { quoted: m.raw })
    await react('✅')
  }
}
