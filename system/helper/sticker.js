import sharp from 'sharp'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { writeFile, unlink, readFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'

const execFileAsync = promisify(execFile)

const MAX_SIDE = 512
const MAX_VIDEO_SEC = 8
const VIDEO_FPS = 15

export async function imageToSticker(buffer, crop = false) {

  let img = sharp(buffer)
  const meta = await img.metadata()

  if (crop) {

    const size = Math.min(meta.width, meta.height)

    img = img.extract({
      left: Math.floor((meta.width - size) / 2),
      top: Math.floor((meta.height - size) / 2),
      width: size,
      height: size
    })

  }

  return img
    .resize(MAX_SIDE, MAX_SIDE, {
      fit: crop ? 'fill' : 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .webp({ quality: 80 })
    .toBuffer()
}

export async function videoToSticker(buffer, ext = 'mp4', crop = false) {

  const id = randomUUID()

  const input = join(tmpdir(), `stk_in_${id}.${ext}`)
  const output = join(tmpdir(), `stk_out_${id}.webp`)

  await writeFile(input, buffer)

  const vf = []

  if (crop) {
    vf.push(`crop=min(iw\\,ih):min(iw\\,ih):(iw-min(iw\\,ih))/2:(ih-min(iw\\,ih))/2`)
  }

  vf.push(`scale=${MAX_SIDE}:${MAX_SIDE}:force_original_aspect_ratio=${crop ? 'disable' : 'decrease'}`)
  vf.push(`fps=${VIDEO_FPS}`)

  if (!crop) {
    vf.push(`pad=${MAX_SIDE}:${MAX_SIDE}:(${MAX_SIDE}-iw)/2:(${MAX_SIDE}-ih)/2:color=#00000000`)
  }

  try {

    await execFileAsync('ffmpeg', [
      '-y',
      '-t', String(MAX_VIDEO_SEC),
      '-i', input,
      '-vf', vf.join(','),
      '-c:v', 'libwebp',
      '-lossless', '0',
      '-quality', '80',
      '-loop', '0',
      '-preset', 'default',
      '-an',
      '-vsync', '0',
      output
    ])

    return await readFile(output)

  } finally {

    await unlink(input).catch(() => {})
    await unlink(output).catch(() => {})

  }
}