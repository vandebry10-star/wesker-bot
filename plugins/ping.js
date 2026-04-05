/* ════════════════════════════════════════════
 * Wesker-MD  ╌  febry wesker
 * ════════════════════════════════════════════
 * file    : plugins/ping.js
 * desc    : plugins › ping
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

import { sendQuotedText, editQuotedText } from '../system/helper/quoted-text.js'

const stat = ms =>
  ms < 200 ? 'excellent' :
  ms < 500 ? 'normal' : 'slow'

export default {
  name: 'ping',
  command: ['ping', 'p', 'p2'],
  category: ['info'],
  description:
    'latency diagnostics\n' +
    '-n = network\n' +
    '-h = handler\n' +
    '-q = queue\n' +
    'tanpa arg = all',

  async run({ feb, m, chat, args }) {
    const mode = args[0] || 'all'

    const ts = m.raw?.messageTimestamp ? Number(m.raw.messageTimestamp) * 1000 : null
    let queueMs = ts ? Date.now() - ts : null
    if (queueMs !== null && queueMs < 0) queueMs = 0

    const h0 = performance.now()
    await new Promise(resolve => setTimeout(resolve, 0))
    const handlerMs = performance.now() - h0

    let out = ''

    if (mode === '-q' || mode === 'all')
      out += `queue   : ${queueMs !== null ? queueMs + ' ms' : 'n/a'}\n`

    if (mode === '-h' || mode === 'all')
      out += `handler : ${handlerMs.toFixed(2)} ms\n`

    if (mode !== '-n' && mode !== 'all') {
      return sendQuotedText({
        feb, chat, m,
        text: out.trim(),
        mentionedJid: 'auto'
      })
    }

    const t0 = Date.now()
    const sent = await sendQuotedText({
      feb, chat, m,
      text: 'Hello World!',
      mentionedJid: 'auto'
    })
    const netMs = Date.now() - t0

    out += `network : ${netMs} ms\n`

    await editQuotedText({
      feb, chat, m,
      key: sent.key,
      text: out.trim(),
      mentionedJid: 'auto'
    })
  }
}