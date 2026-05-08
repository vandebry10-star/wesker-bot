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
 * ════════════════════════════════════════════ */

import { jidNormalizedUser } from 'baileys'
import { injectSendHelpers } from './helper/send.js'

export default async function serialize(feb, msg, store) {
  if (!msg || !msg.message) return null

  const m = {}
  m.raw = msg

  m.id      = msg.key.id
  m.chat    = msg.key.remoteJid
  m.fromMe  = msg.key.fromMe

  const rawSender = msg.key.fromMe
    ? feb.user?.id
    : msg.key.participant || msg.key.remoteJid

  m.sender   = jidNormalizedUser(rawSender)
  m.isGroup  = m.chat.endsWith('@g.us')
  m.pushName = msg.pushName || null

  if (msg.message?.reactionMessage?.key) {
    const rKey   = msg.message.reactionMessage.key
    const stored = store?.get(rKey.id)
    m.target = stored?.serialized || {
      id        : rKey.id,
      raw       : stored?.raw || null,
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
    msg.message?.audioMessage?.contextInfo ||
    msg.message?.viewOnceMessage?.message?.extendedTextMessage?.contextInfo ||
    null

  m.mentions = contextInfo?.mentionedJid?.map(jidNormalizedUser) || []

  if (contextInfo?.stanzaId) {
    const quotedId     = contextInfo.stanzaId
    const quotedSender = contextInfo.participant
      ? jidNormalizedUser(contextInfo.participant)
      : null

    const stored = store?.get(quotedId)

    if (!stored && contextInfo.quotedMessage && store) {
      store.add(quotedId, {
        raw: {
          key: {
            id         : quotedId,
            remoteJid  : m.chat,
            fromMe     : false,
            participant: contextInfo.participant || null
          },
          message : contextInfo.quotedMessage,
          pushName: null
        }
      })
    }

    const reStored  = store?.get(quotedId)
    const quotedRaw = reStored?.raw || null

    m.quoted = {
      id      : quotedId,
      sender  : quotedSender,
      pushName: quotedRaw?.pushName || null,
      raw     : quotedRaw,
      message : quotedRaw?.message || contextInfo.quotedMessage || null,
      serialized: reStored?.serialized || null
    }
  } else {
    m.quoted = null
  }

  m.reply = (text, opts = {}) => {
    let quoted = m.target?.raw || m.raw
    if (quoted?.key?.fromMe) quoted = m.raw
    return feb.sendMessage(m.chat, { text, ...opts }, { quoted })
  }

  m.react = emoji => feb.sendMessage(m.chat, {
    react: { text: emoji, key: msg.key }
  })

  injectSendHelpers(feb, m)

  return m
}