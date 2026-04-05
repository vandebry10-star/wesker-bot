/* ════════════════════════════════════════════
 * Wesker-MD  ╌  febry wesker
 * ════════════════════════════════════════════
 * file    : system/helper/wesker-message.js
 * desc    : system › helper › wesker-message
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

export function normalizeMentions(mentions = []) {
  if (!Array.isArray(mentions)) mentions = [mentions]
  return mentions.filter(Boolean)
}

export function buildContextInfo(mentions = []) {
  return {
    participant: '0@s.whatsapp.net',
    quotedMessage: {
      contactMessage: {
        displayName: '🔖 wesker',
        vcard:
          'BEGIN:VCARD\n' +
          'VERSION:3.0\n' +
          'N:XL;Wesker,;;;\n' +
          'FN:Wesker\n' +
          'item1.TEL;waid=13135550002:+1 (313) 555-0002\n' +
          'item1.X-ABLabel:Ponsel\n' +
          'END:VCARD'
      }
    },
    mentionedJid: normalizeMentions(mentions)
  }
}

function normalizeQuoted(quoted) {
  if (quoted?.key && quoted?.message) return quoted
  if (quoted?.raw?.key && quoted?.raw?.message)
    return quoted.raw
  return undefined
}

export async function weskerSend(
  feb,
  jid,
  payload,
  options = {}
) {
  const {
    mentions = [],
    mimetype,
    fileName,
    caption,
    quoted,
    system = false
  } = options

  const contextInfo = buildContextInfo(mentions)
  const safeQuoted = normalizeQuoted(quoted)

  if (system === true) {
    return feb.relayMessage(
      jid,
      payload,
      {
        messageId: crypto.randomUUID(),
        quoted: safeQuoted
      }
    )
  }

  if (typeof payload === 'string') {
    return feb.relayMessage(
      jid,
      {
        viewOnceMessage: {
          message: {
            extendedTextMessage: {
              text: payload,
              contextInfo
            }
          }
        }
      },
      {
        messageId: crypto.randomUUID(),
        quoted: safeQuoted
      }
    )
  }

  if (payload?.document) {
    return feb.sendMessage(
      jid,
      {
        document: payload.document,
        mimetype: mimetype || 'application/octet-stream',
        fileName: fileName || 'file.bin',
        caption,
        contextInfo
      },
      { quoted: safeQuoted }
    )
  }

  return feb.sendMessage(
    jid,
    {
      ...payload,
      caption,
      contextInfo
    },
    { quoted: safeQuoted }
  )
}

export const weskerReply = (
  feb,
  m,
  text,
  opt = {}
) =>
  weskerSend(feb, m.chat, text, {
    ...opt,
    quoted: m
  })
