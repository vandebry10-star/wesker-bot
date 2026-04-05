/* ════════════════════════════════════════════
 * Wesker-MD  ╌  febry wesker
 * ════════════════════════════════════════════
 * file    : plugins/up.js
 * desc    : plugins › up
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

import fetch    from 'node-fetch'
import FormData from 'form-data'
import { downloadMedia } from '../system/helper/download-media.js'
import { quoteContext }  from '../system/helper/util.js'
import { sendNativeFlow } from '../system/helper/nativeflow.js'

/* ─ uploaders ─ */
async function uguu(buffer, filename) {
  const form = new FormData()
  form.append('files[]', buffer, filename)
  const res  = await fetch('https://uguu.se/upload.php', { method: 'POST', body: form })
  const json = await res.json()
  return json?.files?.[0]?.url || null
}

async function tmpfiles(buffer, filename) {
  const form = new FormData()
  form.append('file', buffer, filename)
  const res  = await fetch('https://tmpfiles.org/api/v1/upload', { method: 'POST', body: form })
  const json = await res.json()
  return json?.data?.url?.replace('tmpfiles.org/', 'tmpfiles.org/dl/') || null
}

async function catbox(buffer, filename) {
  const form = new FormData()
  form.append('reqtype', 'fileupload')
  form.append('fileToUpload', buffer, filename)
  const res  = await fetch('https://catbox.moe/user/api.php', { method: 'POST', body: form })
  const text = await res.text()
  return text.startsWith('http') ? text.trim() : null
}

/* ─ helpers ─ */
function getExt(msg) {
  return msg.mimetype?.split('/')[1] || msg.fileName?.split('.').pop() || 'bin'
}

export default {
  name    : 'upload',
  command : ['up', 'upload'],
  category: ['tools'],

  async run({ feb, m, chat, react }) {
    const q = m.quoted || m

    const msg =
      q.message?.imageMessage    ||
      q.message?.videoMessage    ||
      q.message?.audioMessage    ||
      q.message?.stickerMessage  ||
      q.message?.documentMessage

    if (!msg) return m.reply('reply / kirim media')

    await react('☁️')

    let type = 'document'
    if (q.message?.imageMessage)   type = 'image'
    if (q.message?.videoMessage)   type = 'video'
    if (q.message?.audioMessage)   type = 'audio'
    if (q.message?.stickerMessage) type = 'sticker'

    let buffer
    try {
      buffer = await downloadMedia(msg, type)
    } catch {
      return m.reply('gagal ambil media')
    }

    const filename = `upload.${getExt(msg)}`
    const sizeMB   = (buffer.length / 1024 / 1024).toFixed(2)

    // upload ke 3 endpoint parallel
    const [urlTmp, urlUguu, urlCatbox] = await Promise.allSettled([
      tmpfiles(buffer, filename),
      uguu(buffer, filename),
      catbox(buffer, filename)
    ]).then(r => r.map(x => x.status === 'fulfilled' ? x.value : null))

    if (!urlTmp && !urlUguu && !urlCatbox) {
      await react('❌')
      return m.reply('semua endpoint gagal')
    }

    // label pakai tmpfiles (atau fallback ke yang berhasil)
    const labelUrl = urlTmp || urlUguu || urlCatbox

    // expiry tmpfiles = 24 jam
    const expTs = Date.now() + 24 * 60 * 60 * 1000

    // rows untuk sheet — hanya yang berhasil
    const rows = [
      urlTmp    && { title: 'tmpfiles', description: 'expired 24 jam · ' + urlTmp,    id: urlTmp    },
      urlUguu   && { title: 'uguu',     description: 'expired 3 hari · ' + urlUguu,   id: urlUguu   },
      urlCatbox && { title: 'catbox',   description: 'permanent · ' + urlCatbox,       id: urlCatbox },
    ].filter(Boolean)

    const out = {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            contextInfo: quoteContext(m),
            body  : {
              text:
                `upload success!\n` +
                `⟡ type ╌ ${type}\n` +
                `⟡ size ╌ ${sizeMB} MB`
            },
            footer: { text: 'tap the label above to copy ' },
            nativeFlowMessage: {
              buttons: [
                urlTmp    && {
                  name: 'cta_copy',
                  buttonParamsJson: JSON.stringify({ display_text: 'tmpfiles', copy_code: urlTmp })
                },
                urlUguu   && {
                  name: 'cta_copy',
                  buttonParamsJson: JSON.stringify({ display_text: 'uguu', copy_code: urlUguu })
                },
                urlCatbox && {
                  name: 'cta_copy',
                  buttonParamsJson: JSON.stringify({ display_text: 'catbox', copy_code: urlCatbox })
                }
              ].filter(Boolean),
              messageParamsJson: JSON.stringify({
                limited_time_offer: {
                  text           : 'expires in 24 hours',
                  url            : labelUrl,
                  copy_code      : labelUrl,
                  expiration_time: expTs
                },
                bottom_sheet: {
                  in_thread_buttons_limit: 1,
                  list_title             : 'upload result',
                  button_title           : 'all result'
                }
              })
            }
          }
        }
      }
    }

    await sendNativeFlow(feb, chat, out)

    await react('✅')
  }
}}
