/* ════════════════════════════════════════════
 * Wesker-MD  ╌  febry wesker
 * ════════════════════════════════════════════
 * file    : plugins/botinfo.js
 * desc    : bot & server status monitor
 * author  : feb  ⪩  2026
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
import { generateWAMessageFromContent } from 'baileys'

const IMG = 'https://cloud.yardansh.com/DVdN8c.jpg'

function uptime(sec) {
  sec = Math.floor(sec)
  const d = Math.floor(sec / 86400)
  const h = Math.floor((sec % 86400) / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  return [d && `${d}d`, h && `${h}h`, m && `${m}m`, `${s}s`].filter(Boolean).join(' ')
}

function bytes(b) {
  if (!b) return '0 B'
  const u = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(b) / Math.log(1024))
  return `${(b / Math.pow(1024, i)).toFixed(2)} ${u[i]}`
}

export default {
  name: 'botinfo',
  command: ['botinfo', 'server'],
  category: ['info'],
  description: 'bot & server status realtime',

  async run({ feb, m, react }) {
    try { await react('⏳') } catch {}

    const mem   = process.memoryUsage()
    const total = os.totalmem()
    const free  = os.freemem()

    const text =
      `*runtime*\n` +
      `⟡ uptime  ╌ ${uptime(process.uptime())}\n` +
      `⟡ node    ╌ ${process.version}\n` +
      `⟡ pid     ╌ ${process.pid}\n\n` +
      `*memory (bot)*\n` +
      `⟡ rss     ╌ ${bytes(mem.rss)}\n` +
      `⟡ heap    ╌ ${bytes(mem.heapUsed)} / ${bytes(mem.heapTotal)}\n` +
      `⟡ ext     ╌ ${bytes(mem.external)}\n\n` +
      `*server*\n` +
      `⟡ os      ╌ ${os.platform()} ${os.arch()}\n` +
      `⟡ cpu     ╌ ${os.cpus().length} cores\n` +
      `⟡ ram     ╌ ${bytes(total - free)} / ${bytes(total)}\n` +
      `⟡ load    ╌ ${os.loadavg().map(v => v.toFixed(2)).join(', ')}`

    let img = null
    try {
      const res = await fetch(IMG)
      if (res.ok) img = Buffer.from(await res.arrayBuffer())
    } catch {}

    const msg = generateWAMessageFromContent(m.chat, {
      orderMessage: {
        orderId       : '666999666999',
        thumbnail     : img,
        itemCount     : Math.floor(process.uptime()),
        status        : 1,
        surface       : 1,
        message       : text,
        orderTitle    : 'status',
        sellerJid     : feb.user.id,
        token         : 'token',
        contextInfo   : {
          participant   : m.sender,
          stanzaId      : m.raw?.key?.id,
          quotedMessage : m.raw?.message || {}
        }
      }
    }, { userJid: feb.user.id })

    await feb.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
    try { await react('ℹ️') } catch {}
  }
}
