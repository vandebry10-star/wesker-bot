/* ════════════════════════════════════════════
 * Wesker-MD  ╌  febry wesker
 * file    : plugins/getid.js
 * ════════════════════════════════════════════ */

import crypto from 'node:crypto'

function normalizeMentions(mentions = []) {
  if (!Array.isArray(mentions)) mentions = [mentions]
  return mentions.filter(Boolean)
}

function buildContextInfo(mentions = []) {
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

export default {
  name: 'get group jid',
  command: ['gid'],
  category: ['tools'],
  description: 'ambil jid grup/m.chat',

  async run({ feb, m, chat }) {
    if (!chat.endsWith('@g.us')) {
      return m.reply('ini bukan grup kocak')
    }

    const gid = chat

    const msg = {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            
            body: {
              text: '\u200e'
            },

            footer: {
              text: `jid here\n${gid}`
            },

            contextInfo: buildContextInfo(),

            nativeFlowMessage: {
              buttons: [
                {
                  name: 'cta_copy',
                  buttonParamsJson: JSON.stringify({
                    display_text: 'copy',
                    copy_code: gid
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

    const additionalNodes = [
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

    await feb.relayMessage(chat, msg, {
      quoted: m,
      messageId: crypto.randomUUID(),
      additionalNodes
    })
  }
}
