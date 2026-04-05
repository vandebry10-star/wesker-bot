/* ════════════════════════════════════════════
 * Wesker-MD  ╌  febry wesker
 * ════════════════════════════════════════════
 * file    : plugins/hidden.js
 * desc    : plugins › hidden
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

function buildCategoryTree(cat, cmds, isLastCat) {
  const catPrefix = isLastCat ? '└─' : '├─'
  const indent = isLastCat ? '   ' : '│  '
  let out = `${catPrefix} ${cat}\n`
  for (const [i, cmd] of cmds.entries()) {
    const isLast = i === cmds.length - 1
    out += `${indent}${isLast ? '└─' : '├─'} ${cmd}\n`
  }
  return out
}

export default {
  name: 'hidden command',
  command: ['hidden'],
  category: ['dev'],
  description: 'daftar perintah yang disembunyikan',

  async run({ feb, m, wesker, other }) {
    if (!wesker)
      return m.reply('pengelola plugin tiada tersedia')

    const map = new Map()

    for (const p of wesker.getAllPlugins()) {
      const isHidden =
        p.hidden === true ||
        p.noMenu === true ||
        p.category?.includes('hidden')

      if (!isHidden) continue
      if (!Array.isArray(p.command) || !p.command[0]) continue

      const cat = (p.category?.[0] || 'lainnja').toUpperCase()
      if (!map.has(cat)) map.set(cat, [])

      map.get(cat).push(p.command[0])
    }

    if (!map.size) {
      return m.reply('tiada perintah tersembunyi')
    }

    for (const [cat, cmds] of map) {
      map.set(cat, cmds.sort())
    }

    const categories = [...map.keys()].sort()

    let body = '*hidden command*\n\n'

    for (const [i, cat] of categories.entries()) {
      const isLast = i === categories.length - 1
      body += buildCategoryTree(cat, map.get(cat), isLast)
    }

    body += ''

    await m.reply(body.trim())
  }
}
