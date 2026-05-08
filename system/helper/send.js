/* ════════════════════════════════════════════
 * Wesker-MD  ╌  febry wesker
 * ════════════════════════════════════════════
 * file    : system/helper/send.js
 * desc    : helper › send — shorthand semua tipe pesan
 * author  : febry  ⪩  2026
 * ════════════════════════════════════════════
 *
 * Semua function di sini bisa dipakai langsung
 * dari ctx plugin tanpa perlu import manual:
 *
 *   m.sendText('halo!')
 *   m.sendImage(buffer, 'caption')
 *   m.sendVideo(buffer, 'caption')
 *   m.sendAudio(buffer)
 *   m.sendSticker(buffer)
 *   m.sendDocument(buffer, 'file.pdf')
 *   m.sendLocation(lat, lng, 'nama')
 *   m.sendContact('628xxx', 'Nama')
 *   m.sendButtons('judul', 'isi', [...buttons])
 *   m.react('✅')
 *   m.reply('teks')
 *
 * Atau import manual kalau perlu lebih kontrol:
 *   import { sendText, sendImage, ... } from '../system/helper/send.js'
 *   sendText(feb, m, 'halo!')
 *
 * ════════════════════════════════════════════ */
import {
  imageToSticker,
  videoToSticker
} from './sticker.js'

// ── internal: normalize quoted ────────────────

function normalizeQuoted(quoted) {
  if (!quoted) return undefined
  if (quoted?.key && quoted?.message) return quoted
  if (quoted?.raw?.key && quoted?.raw?.message) return quoted.raw
  return undefined
}

export function sendText(feb, m, text, opts = {}) {
  const { quoted, mentions = [] } = opts
  return feb.sendMessage(
    m.chat,
    { text, mentions },
    { quoted: normalizeQuoted(quoted) || m.raw }
  )
}

export function sendImage(feb, m, image, caption = '', opts = {}) {
  const { quoted, mentions = [] } = opts
  const src = typeof image === 'string' ? { url: image } : image
  return feb.sendMessage(
    m.chat,
    { image: src, caption, mentions },
    { quoted: normalizeQuoted(quoted) || m.raw }
  )
}

export function sendVideo(feb, m, video, caption = '', opts = {}) {
  const { quoted, mentions = [], gifPlayback = false } = opts
  const src = typeof video === 'string' ? { url: video } : video
  return feb.sendMessage(
    m.chat,
    { video: src, caption, mentions, gifPlayback },
    { quoted: normalizeQuoted(quoted) || m.raw }
  )
}

export async function sendSticker(feb, m, sticker, opts = {}) {

  const {
    quoted,
    crop = false,
    type = 'image'
  } = opts

  let webp

  if (type === 'sticker') {
    webp = sticker
  }

  else if (type === 'video') {
    webp = await videoToSticker(sticker, 'mp4', crop)
  }

  else {
    webp = await imageToSticker(sticker, crop)
  }

  return feb.sendMessage(
    m.chat,
    { sticker: webp },
    { quoted: normalizeQuoted(quoted) || m.raw }
  )
}

export function sendDocument(feb, m, document, fileName = 'file.bin', opts = {}) {
  const { quoted, mimetype = 'application/octet-stream', caption } = opts
  const src = typeof document === 'string' ? { url: document } : document
  return feb.sendMessage(
    m.chat,
    { document: src, fileName, mimetype, caption },
    { quoted: normalizeQuoted(quoted) || m.raw }
  )
}

export function sendLocation(feb, m, latitude, longitude, name = '', opts = {}) {
  const { quoted } = opts
  return feb.sendMessage(
    m.chat,
    { location: { degreesLatitude: latitude, degreesLongitude: longitude, name } },
    { quoted: normalizeQuoted(quoted) || m.raw }
  )
}

export function sendContact(feb, m, number, displayName = 'Contact', opts = {}) {
  const { quoted } = opts
  const clean = number.replace(/\D/g, '')
  const vcard =
    'BEGIN:VCARD\n' +
    'VERSION:3.0\n' +
    `FN:${displayName}\n` +
    `TEL;type=CELL;waid=${clean}:+${clean}\n` +
    'END:VCARD'

  return feb.sendMessage(
    m.chat,
    { contacts: { displayName, contacts: [{ vcard }] } },
    { quoted: normalizeQuoted(quoted) || m.raw }
  )
}

export function sendMention(feb, m, text, jids = [], opts = {}) {
  const { quoted } = opts
  return feb.sendMessage(
    m.chat,
    { text, mentions: jids },
    { quoted: normalizeQuoted(quoted) || m.raw }
  )
}

export function sendButtons(feb, m, body, footer = '', buttons = [], opts = {}) {
  const { quoted, header = '' } = opts

  const nativeButtons = buttons.map(b => ({
    name: 'quick_reply',
    buttonParamsJson: JSON.stringify({ display_text: b.label, id: b.id })
  }))

  return feb.sendMessage(
    m.chat,
    {
      interactiveMessage: {
        body: { text: body },
        footer: { text: footer },
        header: header ? { hasMediaAttachment: false, text: header } : undefined,
        nativeFlowMessage: {
          buttons: nativeButtons,
          messageParamsJson: ''
        }
      }
    },
    { quoted: normalizeQuoted(quoted) || m.raw }
  )
}

export function forwardMessage(feb, m, rawMsg) {
  const content = rawMsg?.message || rawMsg
  return feb.sendMessage(m.chat, { forward: rawMsg })
}

export function deleteMessage(feb, m, targetKey) {
  const key = targetKey || m.quoted?.raw?.key || m.raw?.key
  if (!key) return Promise.resolve()
  return feb.sendMessage(m.chat, { delete: key })
}

export function injectSendHelpers(feb, m) {
  m.sendText     = (text, opts)                    => sendText(feb, m, text, opts)
  m.sendImage    = (image, caption, opts)          => sendImage(feb, m, image, caption, opts)
  m.sendVideo    = (video, caption, opts)          => sendVideo(feb, m, video, caption, opts)
  m.sendAudio    = (audio, opts)                   => sendAudio(feb, m, audio, opts)
  m.sendVoice    = (audio, opts)                   => sendVoice(feb, m, audio, opts)
  m.sendSticker  = (sticker, opts)                 => sendSticker(feb, m, sticker, opts)
  m.sendDocument = (doc, fileName, opts)           => sendDocument(feb, m, doc, fileName, opts)
  m.sendLocation = (lat, lng, name, opts)          => sendLocation(feb, m, lat, lng, name, opts)
  m.sendContact  = (number, displayName, opts)     => sendContact(feb, m, number, displayName, opts)
  m.sendMention  = (text, jids, opts)              => sendMention(feb, m, text, jids, opts)
  m.sendButtons  = (body, footer, buttons, opts)   => sendButtons(feb, m, body, footer, buttons, opts)
  m.forwardMsg   = (rawMsg)                        => forwardMessage(feb, m, rawMsg)
  m.deleteMsg    = (targetKey)                     => deleteMessage(feb, m, targetKey)
}