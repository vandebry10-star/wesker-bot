import { jidNormalizedUser } from 'baileys'
import { isLocked, lockBot, unlockBot } from '../../system/runtime/lock.js'

export default {
  name: 'lock',
  command: ['lock', 'unlock'],
  category: ['owner'],
  description: 'kunci / buka respon bot via tag',

  async run(ctx) {
    const { feb, m, command, args } = ctx

    const botJid    = jidNormalizedUser(feb.user?.id)
    const botLid    = jidNormalizedUser(feb.user?.lid || '')
    const botNumber = botJid.split('@')[0].split(':')[0]

    const mentions     = m.mentions || []
    const textMentions = [...((m.text || '').matchAll(/@(\d+)/g))].map(r => r[1])

    const isMentioned =
      mentions.some(j => jidNormalizedUser(j) === botJid || jidNormalizedUser(j) === botLid) ||
      textMentions.includes(botNumber)

    // 'lock me' / 'unlock me' — self-message dari bot itu sendiri.
    // Cegah bentrok antar instance bot dengan sc sama: fromMe cuma true di instance yg ngirim.
    const isSelfCmd = args?.[0]?.toLowerCase() === 'me' && m.fromMe === true

    if (!isMentioned && !isSelfCmd) return

    if (command === 'lock') {
      if (isLocked()) {
        return m.sendText('udah lock')
      }
      lockBot()
      console.log('bot sedang dalam keadaan lock 🔒')
      return m.sendText('successfully locked bot 🔒')
    }

    if (command === 'unlock') {
      if (!isLocked()) {
        return m.sendText('lah lagi gak lock jir')
      }
      unlockBot()
      console.log('bot unlock 🔓')
      return m.sendText('successfully unlocked bot 🔓')
    }
  }
}
