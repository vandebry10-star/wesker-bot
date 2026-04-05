/* ════════════════════════════════════════════
 * Wesker-MD  ╌  febry wesker
 * ════════════════════════════════════════════
 * file    : system/serialize.js
 * desc    : system › serialize
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

import { jidNormalizedUser } from 'baileys'

export default async function serialize(feb, msg, store) {
  if (!msg || !msg.message) return null

  const m = {}
  m.raw = msg

  m.id = msg.key.id
  m.chat = msg.key.remoteJid
  m.fromMe = msg.key.fromMe

  const rawSender = msg.key.fromMe
    ? feb.user?.id
    : msg.key.participant || msg.key.remoteJid

  m.sender = jidNormalizedUser(rawSender)
  m.isGroup = m.chat.endsWith('@g.us')

  if (msg.message?.reactionMessage?.key) {
    const rKey = msg.message.reactionMessage.key
    const stored = store?.get(rKey.id)

    m.target = stored?.serialized || {
      id: rKey.id,
      raw: stored?.raw || null,
      serialized: null
    }
  } 

  m.text =
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    msg.message?.imageMessage?.caption ||
    msg.message?.videoMessage?.caption ||
    msg.message?.documentMessage?.caption ||
    null

  m.buttonId =
    msg.message?.templateButtonReplyMessage?.selectedId ||
    null

  const contextInfo =
    msg.message?.extendedTextMessage?.contextInfo ||
    msg.message?.imageMessage?.contextInfo ||
    msg.message?.videoMessage?.contextInfo ||
    msg.message?.documentMessage?.contextInfo ||
    msg.message?.viewOnceMessage?.message
      ?.extendedTextMessage?.contextInfo ||
    null

  m.mentions =
    contextInfo?.mentionedJid?.map(jidNormalizedUser) || []

  if (contextInfo?.stanzaId) {
    const quotedId = contextInfo.stanzaId
    const quotedSender = contextInfo.participant
      ? jidNormalizedUser(contextInfo.participant)
      : null

    const stored = store?.get(quotedId)

    m.quoted = {
      id: quotedId,
      sender: quotedSender,
      raw: stored?.raw || null,
      message:
        stored?.raw?.message ||
        contextInfo.quotedMessage ||
        null,
      serialized: stored?.serialized || null
    }
  } else {
    m.quoted = null
  }

  m.reply = (text, opts = {}) => {
    let quoted = m.target?.raw || m.raw

    if (quoted?.key?.fromMe) {
      quoted = m.raw
    }

    return feb.sendMessage(
      m.chat,
      { text, ...opts },
      { quoted }
    )
  }

m.react = emoji => {
  
  const commandKey = msg.key

  return feb.sendMessage(m.chat, {
    react: {
      text: emoji,
      key: commandKey
    }
  })
}
  return m
}
