import { jidNormalizedUser } from 'baileys'
import { isLocked, lockBot, unlockBot } from '../../system/helper/lock.js'

export default {
  name: 'lock',
  command: ['lock', 'unlock'],
  category: ['owner'],
  description: 'kunci / buka respon bot via tag',

  async run(ctx) {
    const { feb, m, command } = ctx

    const botJid    = jidNormalizedUser(feb.user?.id)
    const botLid    = jidNormalizedUser(feb.user?.lid || '')
    const botNumber = botJid.split('@')[0].split(':')[0]

    const mentions     = m.mentions || []
    const textMentions = [...((m.text || '').matchAll(/@(\d+)/g))].map(r => r[1])

    const isMentioned =
      mentions.some(j => jidNormalizedUser(j) === botJid || jidNormalizedUser(j) === botLid) ||
      textMentions.includes(botNumber)

    if (!isMentioned) return

    if (command === 'lock') {
      if (isLocked()) {
        return m.sendText('udah lock')
      }
      lockBot()
      return m.sendText('successfully locked bot 🔒')
    }

    if (command === 'unlock') {
      if (!isLocked()) {
        return m.sendText('lah lagi gak lock jir')
      }
      unlockBot()
      return m.sendText('successfully unlocked bot 🔓')
    }
  }
}
