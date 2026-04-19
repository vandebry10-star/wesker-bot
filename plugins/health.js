/* ════════════════════════════════════════════
 * Wesker-MD  ╌  febry wesker
 * ════════════════════════════════════════════
 * file    : plugins/health.js
 * desc    : plugins › health
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
import fetch from 'node-fetch'

const getCPUUsage = () => {
  const stats1 = os.cpus().map(cpu => cpu.times)
  return new Promise(resolve => {
    setTimeout(() => {
      const stats2 = os.cpus().map(cpu => cpu.times)
      let totalUsage = 0
      for (let i = 0; i < stats1.length; i++) {
        const s1   = stats1[i], s2 = stats2[i]
        const idle  = s2.idle - s1.idle
        const total = Object.values(s2).reduce((a, b) => a + b) - Object.values(s1).reduce((a, b) => a + b)
        totalUsage += (1 - idle / total) * 100
      }
      resolve((totalUsage / stats1.length).toFixed(1))
    }, 100)
  })
}

export default {
  name: 'system health',
  command: ['health', 'h'],
  category: ['info'],

  async run({ feb, m, chat, react, raw }) {
    try { await react?.('⚙️') } catch {}

    const cpuLoad = await getCPUUsage()
    const usedMem = os.totalmem() - os.freemem()
    const ramLoad = ((usedMem / os.totalmem()) * 100).toFixed(1)
    const load    = os.loadavg().map(l => l.toFixed(2))

    const chartConfig = {
      type: 'horizontalBar',
      data: {
        labels  : ['cpu', 'ram'],
        datasets: [{
          data           : [cpuLoad, ramLoad],
          backgroundColor: 'rgba(54, 162, 235, 0.8)',
          borderWidth    : 0
        }]
      },
      options: {
        title : { display: true, text: 'resource monitor (%)', fontSize: 14 },
        legend: { display: false },
        scales: { xAxes: [{ ticks: { beginAtZero: true, max: 100 } }] }
      }
    }

    const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}&w=500&h=200&bkg=white`
    const res      = await fetch(chartUrl)
    const buffer   = Buffer.from(await res.arrayBuffer())

    const caption =
      `[ system dashboard ]\n` +
      `────────────────────\n` +
      `• cpu usage : ${cpuLoad}%\n` +
      `• ram usage : ${ramLoad}%\n` +
      `• load avg  : ${load.join(' | ')}\n` +
      `────────────────────\n` +
      `• uptime    : ${(os.uptime() / 3600).toFixed(1)}h\n` +
      `• status    : ${cpuLoad > 85 ? 'overload' : 'stable'}`

    await feb.sendMessage(chat, {
      image  : buffer,
      caption: caption.trim()
    },
                          {
    }, { quoted: raw })
  }
}
