/* ════════════════════════════════════════════
 * Wesker-MD  ╌  febry wesker
 * ════════════════════════════════════════════
 * file    : plugins/dev/debug.js
 * desc    : plugins › debug
 * author  : febry  ⪩  2026
 * ════════════════════════════════════════════
 * © 2026 febry wesker. all rights reserved.
 * do not resell, redistribute, or claim as
 * your own work without explicit permission.
 * ════════════════════════════════════════════ */

import { isDebug, setDebug } from '../../system/helper/debug.js'

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
      return m.sendText('debug on')
    }

    if (sub === 'off') {
      setDebug(false)
      return m.sendText('debug off')
    }

    return m.sendText(`use\ndebug\ndebug status\ndebug on\ndebug off\n\nnote:\n• ga perlu restart`)
  }
}
