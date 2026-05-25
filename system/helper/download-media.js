// wesker-bot · febry.is-a.dev · github.com/vandebry10-star/wesker-bot


import { downloadContentFromMessage } from 'baileys'

export async function downloadMedia(message, type) {
  const stream = await downloadContentFromMessage(message, type)
  let buffer = Buffer.from([])
  for await (const chunk of stream) {
    buffer = Buffer.concat([buffer, chunk])
  }
  return buffer
}
