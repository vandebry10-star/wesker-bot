/* ════════════════════════════════════════════
 * Wesker-MD  ╌  febry wesker
 * file    : plugins/toimg.js
 * ════════════════════════════════════════════ */

import sharp from 'sharp'
import { downloadMedia } from '../system/helper/download-media.js'

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
    const buf = await downloadMedia(msg, 'sticker')
    const img = await sharp(buf).png().toBuffer()
    await feb.sendMessage(chat, { image: img }, { quoted: m.raw })
    await react('✅')
  }
}
