/* ════════════════════════════════════════════
 * Wesker-MD  ╌  febry wesker
 * ════════════════════════════════════════════
 * file    : plugins/s.js
 * desc    : plugins › s
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

import { exec } from 'child_process'

function run(cmd, timeout = 15000) {
  return new Promise((resolve) => {
    exec(cmd, { timeout, maxBuffer: 1024 * 1024 * 5 }, (err, stdout, stderr) => {
      resolve({
        stdout: stdout?.trim() || '',
        stderr: stderr?.trim() || '',
        code: err?.code ?? 0,
        killed: err?.killed ?? false
      })
    })
  })
}

export default {
  name: 'shell',
  command: ['s'],
  category: ['dev'],
  hidden: true,
  description: 's <cmd> — jalankan perintah shell',

  async run({ feb, m, args }) {
    if (!args.length) return m.reply('usage: s <command>')

    const cmd = args.join(' ')

    await m.react('⏳')

    const start = Date.now()
    const result = await run(cmd)
    const elapsed = Date.now() - start

    const out = result.stdout || result.stderr || '(no output)'
    const status = result.killed
      ? '⏱️ timeout'
      : result.code !== 0
      ? `❌ exit ${result.code}`
      : '✅'

    const MAX = 3500
    const body = out.length > MAX
      ? out.slice(0, MAX) + `\n\n... [truncated ${out.length - MAX} chars]`
      : out

    const text =
      `$ ${cmd}\n` +
      `─────────────────\n` +
      `${body}\n` +
      `─────────────────\n` +
      `${status} | ${elapsed}ms`

    await m.react(result.code !== 0 && !result.killed ? '❌' : '✅')
    return feb.sendMessage(m.chat, { text }, { quoted: m.raw })
  }
}
