// wesker-bot · febry.is-a.dev · github.com/vandebry10-star/wesker-bot


import { exec } from 'node:child_process'

function getProgressBar(pct) {
  const width  = 10
  const filled = Math.floor((pct / 100) * width)
  const empty  = width - filled
  return `[${'▰'.repeat(filled)}${'▱'.repeat(empty)}] ${pct}%`
}

function runSpeedtest() {
  return new Promise((resolve, reject) => {
    exec('speedtest --accept-license --accept-gdpr --format=json', { timeout: 120000 }, (err, stdout, stderr) => {
      if (err) {
        const notFound =
          err.code === 'ENOENT' ||
          err.code === 127 ||
          /not found|command not found/i.test(stderr || '') ||
          /not found|command not found/i.test(err.message || '')
        if (notFound) {
          const e = new Error('speedtest CLI tidak ditemukan di PATH')
          e.code = 'MISSING_BINARY'
          e.binary = 'speedtest'
          return reject(e)
        }
        return reject(err)
      }
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

  if (e?.code === 'MISSING_BINARY' && e?.binary === 'speedtest') {
    await feb.sendMessage(m.chat, {
      text:
        '⚠️ *speedtest CLI belum terinstall di VPS*\n\n' +
        'Fitur ini butuh Ookla `speedtest` CLI (bukan `speedtest-cli` python). Install dulu:\n\n' +
        '• Debian / Ubuntu:\n' +
        '  `curl -s https://packagecloud.io/install/repositories/ookla/speedtest-cli/script.deb.sh | sudo bash`\n' +
        '  `sudo apt install -y speedtest`\n' +
        '• RHEL / CentOS:\n' +
        '  `curl -s https://packagecloud.io/install/repositories/ookla/speedtest-cli/script.rpm.sh | sudo bash`\n' +
        '  `sudo yum install -y speedtest`\n' +
        '• macOS (brew):\n' +
        '  `brew tap teamookla/speedtest && brew install speedtest`\n\n' +
        'Cek: `speedtest --version`',
      edit: key
    })
  } else {
    await feb.sendMessage(m.chat, {
      text: `${getProgressBar(100)}\n_ERROR: Connection timed out or failed._`,
      edit: key
    })
  }
    }
  }
}
