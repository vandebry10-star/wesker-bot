/* ════════════════════════════════════════════
 * Wesker-MD  ╌  febry wesker
 * ════════════════════════════════════════════ */

import { isFakeQEnabled } from './fakeq.js'

const WA_PARTICIPANT = '0@s.whatsapp.net'

const MSG_TYPES_WITH_CTX = [
  'extendedTextMessage', 'imageMessage', 'videoMessage', 'audioMessage',
  'stickerMessage', 'documentMessage', 'locationMessage', 'contactMessage',
  'interactiveMessage'
]
function buildDefaultCtx(m) {
  return {
    participant: WA_PARTICIPANT,
    quotedMessage: { conversation: m?.text || '' },
    mentionedJid: m?.sender ? [m.sender] : []
  }
}

function normalizeCtx(ctx, defaultCtx) {
  if (!ctx) return defaultCtx

  if (ctx.participant === WA_PARTICIPANT || ctx.__skipPatch) return ctx

  const { stanzaId, participant, ...rest } = ctx
  return {
    ...rest,
    participant: WA_PARTICIPANT,
    quotedMessage: ctx.quotedMessage || defaultCtx.quotedMessage,
    mentionedJid: ctx.mentionedJid?.length
      ? ctx.mentionedJid
      : defaultCtx.mentionedJid
  }
}

function processSendMessage(content, defaultCtx) {
  if (!content || typeof content !== 'object') return content
  if (content.delete || content.edit || content.react) return content

  if (!isFakeQEnabled()) return content

  return {
    ...content,
    contextInfo: normalizeCtx(content.contextInfo, defaultCtx)
  }
}

function processRelayMessage(content, defaultCtx) {
  if (!content || typeof content !== 'object') return content

  if (!isFakeQEnabled()) return content

  const inner =
    content.viewOnceMessage?.message ||
    content.ephemeralMessage?.message ||
    content

  for (const type of MSG_TYPES_WITH_CTX) {
    if (!inner[type]) continue
    inner[type] = {
      ...inner[type],
      contextInfo: normalizeCtx(inner[type].contextInfo, defaultCtx)
    }
    return content
  }

  if (inner.text !== undefined) {
    inner.contextInfo = normalizeCtx(inner.contextInfo, defaultCtx)
  }

  return content
}

function stripQuotedOpts(opts) {
  if (!opts) return opts
  if (!isFakeQEnabled()) return opts
  const { quoted, ...rest } = opts
  return rest
}

function patchSockMethods(feb, defaultCtx) {
  return new Proxy(feb, {
    get(target, prop) {

      if (prop === 'sendMessage') {
        return async (jid, content, opts) => {
          if (!isFakeQEnabled()) {
            return target.sendMessage(jid, content, opts)
          }
          content = processSendMessage(content, defaultCtx)
          opts = stripQuotedOpts(opts)
          return target.sendMessage(jid, content, opts)
        }
      }

      if (prop === 'relayMessage') {
        return async (jid, content, opts) => {
          if (!isFakeQEnabled()) {
            return target.relayMessage(jid, content, opts)
          }
          content = processRelayMessage(content, defaultCtx)
          return target.relayMessage(jid, content, opts)
        }
      }

      return target[prop]
    }
  })
}

function patchMReply(m, feb, patchedFeb, defaultCtx) {
  m.reply = (text, opts = {}) => {

    if (!isFakeQEnabled()) {
      return feb.sendMessage(m.chat, { text }, { quoted: m.raw, ...opts })
    }

    const content = processSendMessage({ text, ...opts }, defaultCtx)
    return patchedFeb.sendMessage(m.chat, content)
  }

  return m
}

export function patchFeb(feb, m) {
  const defaultCtx = buildDefaultCtx(m)
  const patchedFeb = patchSockMethods(feb, defaultCtx)
  patchMReply(m, feb, patchedFeb, defaultCtx)
  return patchedFeb
}
