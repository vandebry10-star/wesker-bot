/* ════════════════════════════════════════════
 * Wesker-MD  ╌  febry wesker
 * file    : plugins/info.js
 * ════════════════════════════════════════════ */

import os from 'node:os'

function mb(v) { return (v / 1024 / 1024).toFixed(1) }
function fmt(s) {
  s = Math.floor(s)
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60), sec = s % 60
  return `${d}d ${h}h ${m}m ${sec}s`
}

export default {
  name    : 'info',
  command : ['info', 'botinfo'],
  category: ['info'],
  description: 'info bot & server',

  async run({ feb, m }) {
    const mem = process.memoryUsage()
    const out =
      `⟡ node    ╌ ${process.version}\n` +
      `⟡ uptime  ╌ ${fmt(process.uptime())}\n` +
      `⟡ rss     ╌ ${mb(mem.rss)} MB\n` +
      `⟡ heap    ╌ ${mb(mem.heapUsed)} MB\n` +
      `⟡ os      ╌ ${os.type()} ${os.arch()}\n` +
      `⟡ cpu     ╌ ${os.cpus()[0]?.model?.trim().slice(0, 40)}\n` +
      `⟡ mem     ╌ ${mb(os.totalmem() - os.freemem())} / ${mb(os.totalmem())} MB`
    return m.reply(out)
  }
}
