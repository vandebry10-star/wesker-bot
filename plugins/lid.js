/* ════════════════════════════════════════════
 * Wesker-MD  ╌  febry wesker
 * ════════════════════════════════════════════
 * file    : plugins/lid.js
 * desc    : plugins › lid
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

function quoteContext(m) {
  return {
    stanzaId: m.id,
    participant: m.sender,
    quotedMessage: m.raw.message
  }
}

export default {
  name: 'get lid',
  command: ['lid'],
  category: ['tools'],
  description: 'ambil lid target atau reply pesan target',

  async run({ feb, m, chat, sender }) {
    const targetJid = m.quoted?.sender || sender

    const lid = targetJid.includes('@lid')
      ? targetJid
      : targetJid.replace(/@s\.whatsapp\.net$/, '@lid')

    const msg = {
      viewOnceMessage: {
        message: {
          interactiveMessage: {

            contextInfo: quoteContext(m),

            body: {
              text: ' '
            },

            footer: {
              text: `lid here\n${lid}`
            },

            nativeFlowMessage: {
              buttons: [
                {
                  name: 'cta_copy',
                  buttonParamsJson: JSON.stringify({
                    display_text: 'copy',
                    copy_code: lid
                  })
                }
              ],
              messageParamsJson: JSON.stringify({
                in_thread_buttons_limit: 1
              })
            }
          }
        }
      }
    }

    await feb.relayMessage(chat, msg, {
      quoted: m,
      messageId: crypto.randomUUID(),
      additionalNodes: [
        {
          tag: 'biz',
          attrs: {},
          content: [
            {
              tag: 'interactive',
              attrs: { type: 'native_flow', v: '1' },
              content: [
                {
                  tag: 'native_flow',
                  attrs: { v: '9', name: 'mixed' }
                }
              ]
            }
          ]
        }
      ]
    })
  }
}
