// wesker-bot · febry.is-a.dev · github.com/vandebry10-star/wesker-bot


import { formatSeconds } from '../../system/helper/index.js'

export default {
  name: 'runtime',
  command: ['runtime', 'rt'],
  category: ['info'],
  description: 'cek runtime bot (d h m s)',

  async run({ m }) {
    const uptime = process.uptime()
    const formatted = formatSeconds(uptime)

    return m.reply(formatted)
  }
}
