/* ════════════════════════════════════════════
 * Wesker-MD  ╌  febry wesker
 * ════════════════════════════════════════════
 * file    : plugins/tools/sticker.js
 * desc    : plugins › sticker
 * author  : febry  ⪩  2026
 * ════════════════════════════════════════════ */

import { downloadMedia } from '../../system/helper/download-media.js'

async function resolveSource(m){

  if(m.quoted?.raw?.message || m.quoted?.message){

    const q = m.quoted.raw.message

    if(q.imageMessage){
      return {
        buffer: await downloadMedia(q.imageMessage,'image'),
        type: 'image'
      }
    }

    if(q.videoMessage){
      return {
        buffer: await downloadMedia(q.videoMessage,'video'),
        type: 'video'
      }
    }

    if(q.stickerMessage){
      return {
        buffer: await downloadMedia(q.stickerMessage,'sticker'),
        type: 'sticker'
      }
    }

  }

  const raw = m.raw?.message

  if(raw?.imageMessage){
    return {
      buffer: await downloadMedia(raw.imageMessage,'image'),
      type: 'image'
    }
  }

  if(raw?.videoMessage){
    return {
      buffer: await downloadMedia(raw.videoMessage,'video'),
      type: 'video'
    }
  }

  return null
}

export default {

  name: 'sticker',
  command: ['sticker','stiker','stk'],
  category: ['tools'],
  description: 'ya buat bikin sticker-_-',

  async run({ m, args, react }){

    const crop = args[0] === '-c'

    await react('⏳')

    let src

    try{

      src = await resolveSource(m)

    }catch(e){

      await react('❌')
      return m.reply('gagal download media')

    }

    if(!src){

      await react('❌')
      return m.reply(
        'reply gambar/video dengan caption *sticker*'
      )

    }

    try{

      await m.sendSticker(src.buffer,{
        type: src.type,
        crop
      })

      await react('✅')

    }catch(e){

      console.log(e)

      await react('❌')
      return m.reply('gagal convert / kirim sticker')

    }

  }
}