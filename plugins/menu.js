export default {
  name: 'menu',
  command: ['menu'],
  category: ['main'],

  async run({ feb, m, args }) {
    const plugins = feb.pluginManager.plugins

    const user = m.sender
    const username = user.split('@')[0]

    const hour = new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Jakarta',
      hour: 'numeric',
      hour12: false
    }) * 1

    let greet = 'malam'
    if (hour >= 4  && hour < 12) greet = 'pagi'
    else if (hour >= 12 && hour < 15) greet = 'siang'
    else if (hour >= 15 && hour < 18) greet = 'sore'

    const map = {}
    for (const [, p] of plugins) {
      if (p.hidden) continue
      const cats = Array.isArray(p.category) ? p.category : ['other']
      const cmd = Array.isArray(p.command) ? p.command[0] : null
      if (!cmd) continue
      for (const c of cats) {
        if (!map[c]) map[c] = []
        map[c].push({ cmd, desc: p.description || '' })
      }
    }

    const categories = Object.keys(map).sort()
    const totalCmd = categories.reduce((acc, c) => acc + map[c].length, 0)

    // ── menu all ──
    if (args[0]?.toLowerCase() === 'all') {
      const lastCat = categories[categories.length - 1]
      let text = `halo @${username}, selamat ${greet}\n\n`

      for (const cat of categories) {
        const cmds = map[cat].sort((a, b) => a.cmd.localeCompare(b.cmd))
        const isLast = cat === lastCat
        const prefix = isLast ? '└─' : '├─'
        const bar    = isLast ? '   ' : '│  '
        const last   = cmds.length - 1

        text += `${prefix} 🔖 ⌞ ${cat.toUpperCase()} ⌝\n`
        text += cmds.map(({ cmd }, i) => `${bar}${i === last ? '└─' : '├─'} ${cmd}`).join('\n')
        text += `\n${isLast ? '' : '│  \n'}`
      }

      text += `\n> ketik *help* untuk detail semua command`

      return await feb.sendMessage(m.chat, { text, mentions: [user] }, { quoted: m.raw })
    }

    // ── menu <kategori> ──
    if (args[0]) {
      const target = args[0].toLowerCase()

      if (!map[target]) {
        const text =
          `kategori *${target}* tidak ditemukan.\n\n` +
          categories.map(c => `🔖 ⌞ ${c} ⌝`).join('\n') +
          `\n\nketik *menu* untuk untuk melihat kategori menu`

        return await feb.sendMessage(m.chat, { text, mentions: [user] }, { quoted: m.raw })
      }

      const cmds = map[target].sort((a, b) => a.cmd.localeCompare(b.cmd))
      const last  = cmds.length - 1

      const text =
        `*🔖  ${target.toUpperCase()}*\n` +
        cmds.map(({ cmd, desc }, i) => {
          const tree = i === last ? '└─' : '├─'
          return desc ? `${tree} ${cmd}  —  ${desc}` : `${tree} ${cmd}`
        }).join('\n') +
        `\n\n> ketik *menu all* untuk melihat semua menu`

      return await feb.sendMessage(m.chat, { text, mentions: [user] }, { quoted: m.raw })
    }

    // ── menu (home) ──
    const text =
      `halo @${username}, selamat ${greet}\n\n` +
      categories.map(c => `🔖 ⌞ ${c} ⌝`).join('\n') +
      `\n\n> ketik *menu <kategori>* untuk melihat list\n` +
      `> atau *menu all* untuk semua list`

    await feb.sendMessage(m.chat, {
      text,
      mentions: [user],
      contextInfo: {
        externalAdReply: {
          title: 'wesker-bot',
          body: 'dikembangkan oleh febry wesker (feb.azbry.com)',
          thumbnailUrl: 'https://api.azbry.com/api/wesker.jpg',
          sourceUrl: 'https://github.com/vandebry10-star/wesker-bot',
          mediaType: 1,
          renderLargerThumbnail: true,
          showAdAttribution: false
        }
      }
    }, { quoted: m.raw })
  }
}
