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
        map[c].push(cmd)
      }
    }

    const categories = Object.keys(map).sort()
    const totalCmd = categories.reduce((acc, c) => acc + map[c].length, 0)

    // ── menu <kategori> ──
    if (args[0] && args[0].toLowerCase() !== 'all') {
      const target = args[0].toLowerCase()

      if (!map[target]) {
        const text =
          `kategori *${target}* tidak ditemukan.\n\n` +
          categories.map(c => `🔖 ⌞ ${c} ⌝`).join('\n') +
          `\n\nketik *menu <kategori>* untuk membuka`

        return await feb.sendMessage(m.chat, { text, mentions: [user] }, { quoted: m.raw })
      }

      const cmds = map[target].sort()
      const last = cmds.length - 1

      const text =
        `*🔖  ${target.toUpperCase()}*\n` +
        cmds.map((c, i) => i === last ? `└─ ${c}` : `├─ ${c}`).join('\n') +
        `\n\n> ketik *menu <perintah>* untuk detail`

      return await feb.sendMessage(m.chat, { text, mentions: [user] }, { quoted: m.raw })
    }

    // ── menu (home) ──
    const text =
      `halo @${username}, selamat ${greet}\n\n` +
      categories.map(c => `🔖 ⌞ ${c} ⌝`).join('\n') +
      `\n\n> ketik *menu <kategori>* untuk melihat list perkategori\n` +
      `> atau *allmenu* untuk semua list`

    await feb.sendMessage(m.chat, {
      text,
      mentions: [user],
      contextInfo: {
        externalAdReply: {
          title: 'wesker-bot',
          body: 'dikembangkan oleh febry wesker',
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
