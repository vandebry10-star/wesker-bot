// wesker-bot · febry.is-a.dev · github.com/vandebry10-star/wesker-bot


import { quoteContext } from '../../system/util/util.js'
import { sendNativeFlow } from '../../system/messaging/nativeflow.js'

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

    await sendNativeFlow(feb, chat, msg, { quoted: m })
  }
}
