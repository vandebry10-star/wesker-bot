// wesker-bot · febry.is-a.dev · github.com/vandebry10-star/wesker-bot


import { isDebug, setDebug } from '../../system/runtime/debug.js'

export default {
  name: 'debug',
  command: ['debug'],
  category: ['owner'],
  description: 'toggle debug log runtime',

  async run({ m, args }) {
    const sub = args[0]

    if (!sub || sub === 'status') {
      return m.sendText(`debug status: *${isDebug() ? 'idup' : 'mati'}*`)
    }

    if (sub === 'on') {
      setDebug(true)
      console.log('debug diaktifkan')
      return m.sendText('debug on')
    }

    if (sub === 'off') {
      setDebug(false)
      console.loh('debug dimatikan')
      return m.sendText('debug off')
    }

    return m.sendText(`use\ndebug\ndebug status\ndebug on\ndebug off\n\nnote:\n• ga perlu restart`)
  }
}
