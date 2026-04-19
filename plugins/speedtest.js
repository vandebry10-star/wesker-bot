/* ════════════════════════════════════════════
 * Wesker-MD  ╌  febry wesker
 * ════════════════════════════════════════════
 * file    : plugins/speedtest.js
 * desc    : plugins › speedtest
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

import { exec } from 'node:child_process'
import fetch from 'node-fetch'

function getProgressBar(pct) {
  const width  = 10
  const filled = Math.floor((pct / 100) * width)
  const empty  = width - filled
  return `[${'▰'.repeat(filled)}${'▱'.repeat(empty)}] ${pct}%`
}

function runSpeedtest() {
  return new Promise((resolve, reject) => {
    exec('speedtest --accept-license --accept-gdpr --format=json', { timeout: 120000 }, (err, stdout) => {
      if (err) return reject(err)
      try { resolve(JSON.parse(stdout)) } catch { reject(new Error('invalid speedtest output')) }
    })
  })
}

function formatText(r) {
  const dl = (r.download.bandwidth * 8 / 1e6).toFixed(2)
  const ul = (r.upload.bandwidth   * 8 / 1e6).toFixed(2)
  return [
    `Server : ${r.server.name}`,
    `ISP    : ${r.isp}`,
    `Ping   : ${r.ping.latency.toFixed(2)} ms`,
    `DL     : ${dl} Mbps`,
    `UL     : ${ul} Mbps`
  ].join('\n')
}

export default {
  name: 'speedtest',
  command: ['speedtest', 'speed'],
  category: ['info'],
  description: 'cek kecepatan internet server',

  async run({ feb, m, chat }) {
    let { key } = await feb.sendMessage(chat, {
      text: `${getProgressBar(0)}\n_Connecting to server..._`
    }, { quoted: m.raw })

    let progress = 0
    const interval = setInterval(async () => {
      progress += Math.floor(Math.random() * 15) + 5
      if (progress > 90) progress = 90
      await feb.sendMessage(chat, {
        text: `${getProgressBar(progress)}\n_Testing bandwidth..._`,
        edit: key
      })
    }, 1500)

    try {
  const data = await runSpeedtest()
  clearInterval(interval)

  const LINK   = data.result.url
  const imgRes = await fetch(LINK + '.png')
  const buffer = Buffer.from(await imgRes.arrayBuffer())
  const caption = formatText(data)

  await feb.sendMessage(
    m.chat,
    {
      image: buffer,
      caption: caption
    },
    {
      quoted: m.raw
    }
  )

} catch (e) {
  clearInterval(interval)

  await feb.sendMessage(m.chat, {
    text: `${getProgressBar(100)}\n_ERROR: Connection timed out or failed._`,
    edit: key
  })
    }
  }
}
