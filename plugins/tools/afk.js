// wesker-bot · febry.is-a.dev · github.com/vandebry10-star/wesker-bot


import { setAFK, isAFK } from '../../system/helper/afk-store.js'

export default {
  name: 'afk',
  command: ['afk'],
  category: ['user'],
  description: 'away from keyboard with summary',

  async run({ m }) {
    const sender = m.sender
    const chat = m.chat

    if (isAFK(sender)) {
      return m.reply('lah bukannya udah?')
    }

    const reason = m.text
      ?.trim()
      ?.replace(/^afk\s*/i, '')
      ?.trim() || '-'

    setAFK(sender, reason, chat)

    await m.reply(
      `afk aktif\n` +
      `alasan: ${reason}\n` +
      `> titip gorengan :v`
    )
  }
}
