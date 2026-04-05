/* ════════════════════════════════════════════
 * Wesker-MD  ╌  febry wesker
 * ════════════════════════════════════════════
 * file    : system/helper/quoted-text.js
 * desc    : system › helper › quoted-text
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

import crypto from 'node:crypto'

function stripContextInfo(message) {
  if (!message) return { conversation: '' }

  const TYPES = [
    'conversation',
    'extendedTextMessage',
    'imageMessage',
    'videoMessage',
    'audioMessage',
    'documentMessage',
    'stickerMessage',
    'locationMessage',
    'contactMessage',
    'reactionMessage',
    'pollCreationMessage',
    'pollCreationMessageV3'
  ]

  for (const type of TYPES) {
    if (!message[type]) continue
    if (type === 'conversation') return { conversation: message.conversation }

    const { contextInfo, ...rest } = message[type]
    return { [type]: rest }
  }

  return { conversation: '' }
}

export function resolveQuoted(m) {
  if (!m?.raw?.key?.id) return null

  if (m.quoted?.raw?.key?.id && m.quoted?.raw?.message) {
    const q = m.quoted.raw
    return {
      stanzaId: q.key.id,
      participant: q.key.participant || q.key.remoteJid || m.quoted.sender,
      quotedMessage: stripContextInfo(q.message)
    }
  }

  return {
    stanzaId: m.raw.key.id,
    participant: m.sender,
    quotedMessage: stripContextInfo(m.raw.message)
  }
}

function buildTextCtx({ quotedText, participant = '0@s.whatsapp.net', mentionedJid = [], externalAdReply }) {
  return {
    participant,
    ...(mentionedJid.length ? { mentionedJid } : {}),
    ...(externalAdReply ? { externalAdReply } : {}),
    quotedMessage: { conversation: quotedText }
  }
}

function resolveCtx({ m, quotedText, participant = '0@s.whatsapp.net', mentionedJid, externalAdReply }) {
  const text = quotedText ?? m?.text ?? ''

  let jids = []
  if (mentionedJid === 'auto') jids = m?.sender ? [m.sender] : []
  else if (Array.isArray(mentionedJid)) jids = mentionedJid

  return buildTextCtx({ quotedText: text, participant, mentionedJid: jids, externalAdReply })
}

export async function sendQuotedText({
  feb, chat,
  text = '',
  quotedText,   
  m,
  participant = '0@s.whatsapp.net',
  mentionedJid, 
  externalAdReply,
  type = 'text',
  buffer, mimetype, fileName, caption, seconds,
  lat, lng, locationName, locationAddress
}) {
  const ctxInfo = resolveCtx({ m, quotedText, participant, mentionedJid, externalAdReply })

  if (type === 'text')
    return feb.sendMessage(chat, { text, contextInfo: ctxInfo })

  if (type === 'image')
    return feb.sendMessage(chat, {
      image: buffer, caption: caption || text,
      mimetype: mimetype || 'image/jpeg', contextInfo: ctxInfo
    })

  if (type === 'video')
    return feb.sendMessage(chat, {
      video: buffer, caption: caption || text,
      mimetype: mimetype || 'video/mp4', seconds: seconds || 0, contextInfo: ctxInfo
    })

  if (type === 'sticker')
    return feb.sendMessage(chat, {
      sticker: buffer, mimetype: mimetype || 'image/webp', contextInfo: ctxInfo
    })

  if (type === 'audio')
    return feb.sendMessage(chat, {
      audio: buffer, mimetype: mimetype || 'audio/ogg; codecs=opus',
      seconds: seconds || 0, ptt: false, contextInfo: ctxInfo
    })

  if (type === 'document')
    return feb.sendMessage(chat, {
      document: buffer, fileName: fileName || 'file',
      mimetype: mimetype || 'application/octet-stream',
      caption: caption || text, contextInfo: ctxInfo
    })

  if (type === 'location')
    return feb.sendMessage(chat, {
      location: {
        degreesLatitude: lat, degreesLongitude: lng,
        name: locationName || '', address: locationAddress || ''
      },
      contextInfo: ctxInfo
    })

  throw new Error(`[sendQuotedText] tipe tidak dikenal: ${type}`)
}

export async function editQuotedText({
  feb, chat, key, text,
  quotedText, m,
  participant = '0@s.whatsapp.net',
  mentionedJid, externalAdReply
}) {
  const hasCtx = quotedText !== undefined || m !== undefined
  return feb.sendMessage(chat, {
    text,
    edit: key,
    ...(hasCtx ? { contextInfo: resolveCtx({ m, quotedText, participant, mentionedJid, externalAdReply }) } : {})
  })
}
