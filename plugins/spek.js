/* ════════════════════════════════════════════
 * Wesker-MD  ╌  febry wesker
 * ════════════════════════════════════════════
 * file    : plugins/spek.js
 * desc    : plugins › spek
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

import os from 'node:os'
import fs from 'node:fs'
import path from 'node:path'
import fetch from 'node-fetch'

function formatSize(bytes) {
  const sizes = ['b', 'kb', 'mb', 'gb', 'tb']
  if (!bytes) return '0 b'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i]
}

function clock() {
  const s = Math.floor(process.uptime())
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return [h, m, sec].map(v => String(v).padStart(2, '0')).join(':')
}

export default {
  name: 'spesifikasi server',
  command: ['spek'],
  category: ['info'],
  description: 'informasi server, runtime, file & dependencies',

  async run({ feb, chat, m, react, raw }) {
    try { await react?.('⏳') } catch {}

    const cpu      = os.cpus()[0]
    const cpuCores = os.cpus().length
    const totalRam = os.totalmem()
    const freeRam  = os.freemem()
    const usedRam  = totalRam - freeRam
    const runtime  = clock()

    let pkg = {}
    try {
      pkg = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf8'))
    } catch {}

    const depCount    = pkg.dependencies    ? Object.keys(pkg.dependencies).length    : 0
    const devDepCount = pkg.devDependencies ? Object.keys(pkg.devDependencies).length : 0

    let rootFiles = []
    try {
      rootFiles = fs.readdirSync(process.cwd(), { withFileTypes: true })
        .filter(d => d.isFile())
        .map(d => d.name)
    } catch {}

    const helperDir   = path.resolve(process.cwd(), 'system/helper')
    const helperFiles = fs.existsSync(helperDir) ? fs.readdirSync(helperDir).length : 0

    const ramUsedPct = (usedRam / totalRam) * 100
    const ramFreePct = (freeRam / totalRam) * 100
    const loadAvg    = os.loadavg()
    const cpu1m      = Math.min((loadAvg[0] / cpuCores) * 100, 100)
    const cpu5m      = Math.min((loadAvg[1] / cpuCores) * 100, 100)
    const cpu15m     = Math.min((loadAvg[2] / cpuCores) * 100, 100)

    const chartConfig = {
      type: 'bar',
      data: {
        labels: ['RAM Use', 'RAM Free', 'CPU(1m)', 'CPU(5m)', 'CPU(15m)'],
        datasets: [{
          label          : 'Persentase (%)',
          data           : [ramUsedPct.toFixed(1), ramFreePct.toFixed(1), cpu1m.toFixed(1), cpu5m.toFixed(1), cpu15m.toFixed(1)],
          backgroundColor: 'rgba(54, 162, 235, 0.8)',
          borderColor    : 'rgba(54, 162, 235, 1)',
          borderWidth    : 1
        }]
      },
      options: {
        title  : { display: true, text: 'RESOURCE USAGE (%)', fontSize: 16, padding: 15 },
        legend : { display: false },
        layout : { padding: { top: 20, bottom: 10, left: 10, right: 10 } },
        scales : { yAxes: [{ ticks: { beginAtZero: true, max: 100 } }] },
        plugins: {
          datalabels: { anchor: 'end', align: 'top', color: '#333', font: { weight: 'bold' }, formatter: v => v + '%' }
        }
      }
    }

    const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}&w=700&h=400&bkg=white`

    let chartBuffer = null
    try {
      const res = await fetch(chartUrl)
      if (res.ok) chartBuffer = Buffer.from(await res.arrayBuffer())
    } catch {}

    const caption =
      `*cpu:*\n${cpu.model.trim()}\n\n` +
      `*core:*\n${cpuCores}\n\n` +
      `*ram:*\n${formatSize(usedRam)} / ${formatSize(totalRam)}\n\n` +
      `*node:*\n${process.version}\n\n` +
      `*platform:*\n${os.platform()} (${os.arch()})\n\n` +
      `*runtime:*\n${runtime}\n\n` +
      `*project:*\n${pkg.name || '-'} @ ${pkg.version || '-'}\n\n` +
      `*dependencies:*\n${depCount} deps / ${devDepCount} dev\n\n` +
      `*files:*\n${rootFiles.length} root files\n${helperFiles} helper modules`

    if (chartBuffer) {
      await feb.sendMessage(chat, {
        image  : chartBuffer,
        caption: caption,
        contextInfo: {
          externalAdReply: {
            title    : 'spesifikasi',
            body     : 'live server monitor',
            mediaType: 1
          }
        }
      }, { quoted: raw })
    } else {
      await feb.sendMessage(chat, { text: caption }, { quoted: raw })
    }

    try { await react?.('✅') } catch {}
  }
}

