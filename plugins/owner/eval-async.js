// wesker-bot · febry.is-a.dev · github.com/vandebry10-star/wesker-bot


export default {
  name: 'eval',
  hidden: false,
  command: ['ev'],
  category: ['owner'],
  description: 'eval async',

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
