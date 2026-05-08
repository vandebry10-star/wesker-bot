/* ════════════════════════════════════════════
 * Wesker-MD  ╌  febry wesker
 * file    : plugins/system/fakeq.js
 * desc    : plugins › fakeq
 * author  : febry  ⪩  2026
 * ════════════════════════════════════════════ */

import { isFakeQEnabled, setFakeQ } from '../../system/helper/fakeq.js'

export default {
  name    : 'fakeq',
  command : ['fakeq'],
  category: ['owner'],
  description: 'toggle fake quoted (wa verified centang biru)',

  async run({ m, args }) {
    const sub = args[0]

    if (!sub || sub === 'status')
      return m.sendText(`fakeq status: *${isFakeQEnabled() ? 'on' : 'off'}*`)

    if (sub === 'on') {
      if (isFakeQEnabled()) return m.sendText('fakeq udah on')
      setFakeQ(true)
      return m.sendText('fake quoted on')
    }

    if (sub === 'off') {
      if (!isFakeQEnabled()) return m.sendText('fakeq udah off')
      setFakeQ(false)
      return m.sendText('fake quoted off')
    }

    return m.sendText(`use\nfakeq\nfakeq status\nfakeq on\nfakeq off\n\nnote:\n• ga perlu restart`)
  }
}
