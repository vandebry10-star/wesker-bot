import { prepareWAMessageMedia } from 'baileys'
import { sendNativeFlow } from '../system/helper/nativeflow.js'
import { febCtx } from '../system/helper/custom-contexinfo.js'

export default {
name: 'esce',
command: ['sc','esce'],
category: ['info'],

async run({feb, m, chat}) {
const esce = 'https://github.com/vandebry10-star/wesker-bot'

const media = await prepareWAMessageMedia(
    { image: { url: 'https://cloud.yardansh.com/AEzVtQ.jpg' } },
    {upload: feb.waUploadToServer}
)

const msg = {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            contextInfo: febCtx(m),
            header: {
              title: "wesker-bot",
              hasMediaAttachment: true,
                ...media
            },
            body: {
              text: `bot ini menggunakan source code yang bisa kamu temukan di github. klik tombol dibawah untuk melihatnya`
            },
            footer: {
              text: `vandebry10-star/wesker-bot`
            },
            nativeFlowMessage: {
              buttons: [
      {
        name: "cta_copy",
        buttonParamsJson: JSON.stringify({
          display_text: "copy link repo",
          copy_code: "https://github.com/vandebry10-star/wesker-bot"
        })
      },
      {
        name: "cta_url",
        buttonParamsJson: JSON.stringify({
          display_text: "buka link repo",
          url: "https://github.com/vandebry10-star/wesker-bot"
        })
      }
],
              messageParamsJson: JSON.stringify({ v: "1" })
            }
          }
        }
      }
    }

    await sendNativeFlow(feb, chat, msg)
  }
}
