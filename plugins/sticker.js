/* ════════════════════════════════════════════
 * Wesker-MD  ╌  febry wesker
 * ════════════════════════════════════════════
 * file    : plugins/sticker.js
 * desc    : plugins › sticker
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

import sharp from 'sharp'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { writeFile, unlink, readFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { downloadContentFromMessage } from 'baileys'

const execFileAsync = promisify(execFile)

const MAX_SIDE = 512
const MAX_VIDEO_SEC = 8
const VIDEO_FPS = 15

async function downloadMedia(message, type) {
  const stream = await downloadContentFromMessage(message, type)
  const chunks = []
  for await (const chunk of stream) chunks.push(chunk)
  return Buffer.concat(chunks)
}

async function imageToSticker(buffer, crop=false){
  let img = sharp(buffer)
  const meta = await img.metadata()

  if(crop){
    const size = Math.min(meta.width, meta.height)
    img = img.extract({
      left:Math.floor((meta.width-size)/2),
      top:Math.floor((meta.height-size)/2),
      width:size,
      height:size
    })
  }

  return img
    .resize(MAX_SIDE,MAX_SIDE,{
      fit:crop?'fill':'contain',
      background:{r:0,g:0,b:0,alpha:0}
    })
    .webp({quality:80})
    .toBuffer()
}

async function videoToSticker(buffer,ext='mp4',crop=false){

  const id=randomUUID()
  const input=join(tmpdir(),`stk_in_${id}.${ext}`)
  const output=join(tmpdir(),`stk_out_${id}.webp`)

  await writeFile(input,buffer)

  const vf=[]

  if(crop){
    vf.push(`crop=min(iw\\,ih):min(iw\\,ih):(iw-min(iw\\,ih))/2:(ih-min(iw\\,ih))/2`)
  }

  vf.push(`scale=${MAX_SIDE}:${MAX_SIDE}:force_original_aspect_ratio=${crop?'disable':'decrease'}`)
  vf.push(`fps=${VIDEO_FPS}`)

  if(!crop){
    vf.push(`pad=${MAX_SIDE}:${MAX_SIDE}:(${MAX_SIDE}-iw)/2:(${MAX_SIDE}-ih)/2:color=#00000000`)
  }

  try{

    await execFileAsync("ffmpeg",[
      "-y",
      "-t",String(MAX_VIDEO_SEC),
      "-i",input,
      "-vf",vf.join(","),
      "-c:v","libwebp",
      "-lossless","0",
      "-quality","80",
      "-loop","0",
      "-preset","default",
      "-an",
      "-vsync","0",
      output
    ])

    return await readFile(output)

  }finally{

    await unlink(input).catch(()=>{})
    await unlink(output).catch(()=>{})

  }
}

async function resolveSource(m){

  if(m.quoted?.raw?.message || m.quoted?.message){

    const q=m.quoted.raw.message

    if(q.imageMessage){
      return {
        buffer:await downloadMedia(q.imageMessage,"image"),
        type:"image"
      }
    }

    if(q.videoMessage){
      return {
        buffer:await downloadMedia(q.videoMessage,"video"),
        type:"video",
        ext:"mp4"
      }
    }

    if(q.stickerMessage){
      return {
        buffer:await downloadMedia(q.stickerMessage,"sticker"),
        type:"sticker"
      }
    }

  }

  const raw=m.raw?.message

  if(raw?.imageMessage){
    return {
      buffer:await downloadMedia(raw.imageMessage,"image"),
      type:"image"
    }
  }

  if(raw?.videoMessage){
    return {
      buffer:await downloadMedia(raw.videoMessage,"video"),
      type:"video",
      ext:"mp4"
    }
  }

  return null
}

export default {

  name:"sticker",
  command:["sticker","stiker","stk"],
  category:["tools"],

  async run({feb,m,args,react}){

    const crop=args[0]==="-c"

    await react("⏳")

    let src

    try{
      src=await resolveSource(m)
    }catch(e){
      await react("❌")
      return m.reply("gagal download media")
    }

    if(!src){
      await react("❌")
      return m.reply("reply gambar/video dengan caption *sticker*")
    }

    let webp

    try{

      if(src.type==="image"){
        webp=await imageToSticker(src.buffer,crop)
      }
      else if(src.type==="sticker"){
        webp=src.buffer
      }
      else{
        webp=await videoToSticker(src.buffer,src.ext,crop)
      }

    }catch(e){

      await react("❌")
      return m.reply("gagal convert sticker")

    }

    try{

      await feb.sendMessage(
        m.chat,
        {sticker:webp},
        {quoted:m.raw}
      )

      await react("✅")

    }catch(e){

      await react("❌")
      return m.reply("gagal kirim sticker")

    }

  }
}