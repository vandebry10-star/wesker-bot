export default {
  name: 'allmenu',
  command: ['allmenu'],
  category: ['main'],

  async run({ feb, m }) {
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
    const lastCat = categories[categories.length - 1]

    let text = `halo @${username}, selamat ${greet}\n\n`

    for (const cat of categories) {
      const cmds = map[cat].sort()
      const isLast = cat === lastCat
      const prefix = isLast ? '└─' : '├─'
      const bar    = isLast ? '   ' : '│  '
      const last   = cmds.length - 1

      text += `${prefix} 🔖 ⌞ ${cat.toUpperCase()} ⌝\n`
      text += cmds.map((c, i) => `${bar}${i === last ? '└─' : '├─'} ${c}`).join('\n')
      text += `\n${isLast ? '' : '│  \n'}`
    }

    text += `\n> ketik *menu <perintah>* untuk detail`

    await feb.sendMessage(m.chat, { text, mentions: [user] }, { quoted: m.raw })
  }
}
