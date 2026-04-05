/* ════════════════════════════════════════════
 * Wesker-MD  ╌  febry wesker
 * file    : plugins/getid.js
 * ════════════════════════════════════════════ */

import { normalizeMentions, buildContextInfo } from '../system/helper/wesker-message.js'
import { sendNativeFlow } from '../system/helper/nativeflow.js'

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

    await sendNativeFlow(feb, chat, msg, { quoted: m.raw })
  }
}
