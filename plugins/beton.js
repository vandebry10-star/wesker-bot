/* ════════════════════════════════════════════
 * wesker-md  ╌  febry wesker
 * ════════════════════════════════════════════ */

import {sendNativeFlow } from '../system/helper/nativeflow.js'
import { febCtx } from '../system/helper/custom-ctx.js'

export default {
  name: 'beton',
  command: ['beton', 'button'],
  category: ['info'],
  description: 'ini plugin example beton :v',

  async run({ feb, m, chat, sender, role }) {
    const buttons = [
      {
        name: "cta_copy",
        buttonParamsJson: JSON.stringify({
          display_text: "cta_copy",
          copy_code: "https://github.com/vandebry10-star/wesker-bot"
        })
      },
      {
        name: "cta_url",
        buttonParamsJson: JSON.stringify({
          display_text: "cta_url",
          url: "https://github.com/vandebry10-star/wesker-bot"
        })
      },
      {
        name: "quick_reply",
        buttonParamsJson: JSON.stringify({
          display_text: "quick_reply",
          id: "speedtest"
        })
      },
      {
        name: "single_select",
        buttonParamsJson: JSON.stringify({
          title: "single_select",
          sections: [
            {
              title: "example single select",
              rows: [
                {
                  title: "lid",
                  description: "ambil lid",
                  id: "lid"
                },
                {
                  title: "menu",
                  description: "lihat list kategori menu yang tersedia",
                  id: "menu"
                }
              ]
            }
          ],
icon: "DEFAULT"
        })
      }
    ]

    const message = {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            contextInfo: febCtx(m),
            body: {
              text:
                   `lid: ${sender.split('@')[0]}\n` +
                   `role: ${role || 'user'}`
     
            },
            footer: {
              text: "vandebry10-star/wesker-bot"
            },
            nativeFlowMessage: {
              buttons: buttons,
              messageParamsJson: JSON.stringify({ v: "1" })
            }
          }
        }
      }
    }

    await sendNativeFlow(feb, chat, message)
  }
}
