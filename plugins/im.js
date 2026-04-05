/* ════════════════════════════════════════════
 * Wesker-MD  ╌  febry wesker
 * ════════════════════════════════════════════
 * file    : plugins/im.js
 * desc    : plugins › im
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

import { getDevice, isJidGroup } from 'baileys'

export default {
  name: 'inspect message',
  command: ['im'],
  category: ['tools'],
  description: 'inspect message',

  async run({ feb, m }) {
    
    let target = null

    if (m.quoted?.raw) {
      target = m.quoted.raw
    }

    if (
      !target &&
      m.raw?.message?.extendedTextMessage?.contextInfo?.quotedMessage
    ) {
      const ctx = m.raw.message.extendedTextMessage.contextInfo

      target = {
        key: {
          id: ctx.stanzaId,
          participant: ctx.participant,
          remoteJid: m.chat
        },
        message: ctx.quotedMessage
      }
    }

    if (!target?.key || !target?.message) {
      return m.reply('reply pesan wok')
    }

    const key = target.key
    const msg = target.message

    const pushName = m.pushName || '-'
    const device = getDevice(key.id)
    const chatId = key.remoteJid
    const sender = key.participant || key.remoteJid

    const isGroup = isJidGroup(chatId)

    const type =
      Object.keys(msg)[0] || 'unknown'

    const text =
      msg.conversation ||
      msg.extendedTextMessage?.text ||
      msg.imageMessage?.caption ||
      msg.videoMessage?.caption ||
      '-'

    const mediaCtx =
      msg.imageMessage?.contextInfo ||
      msg.videoMessage?.contextInfo ||
      msg.documentMessage?.contextInfo ||
      {}

    const paired =
      mediaCtx.pairedMediaType || '-'
    const statusSource =
      mediaCtx.statusSourceType || '-'
    const nonJid =
      mediaCtx.nonJidMentions ?? '-'

    const result =
`name   : ${pushName}
from   : ${device}
sender : ${sender}
chat   : ${chatId}
group  : ${isGroup ? 'yes' : 'no'}

message
id     :
${key.id}

type   :
${type}

text   :
${text}

context
paired : ${paired}
status : ${statusSource}
nonJid : ${nonJid}
`

    await m.reply(result)
  }
}