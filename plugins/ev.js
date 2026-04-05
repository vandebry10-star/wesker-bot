/* ════════════════════════════════════════════
 * Wesker-MD  ╌  febry wesker
 * ════════════════════════════════════════════
 * file    : plugins/ev.js
 * desc    : plugins › ev
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

export default {
  name: 'eval',
  hidden: true,
  command: ['ev'],
  category: ['owner'],
  description: 'eval anysnc ',

  async run({ feb, m }) {
    const code = m.text.replace(/^ev\s+/i, '')

    if (!code)
      return m.reply('gini jir:\nev <kode>')

    try {
      const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor

      const fn = new AsyncFunction('feb', 'm', `
        ${code}
      `)

      const result = await fn(feb, m)

      if (result !== undefined)
        m.reply(String(result))

    } catch (e) {
      m.reply('❌ ' + (e?.stack || e?.message))
    }
  }
}