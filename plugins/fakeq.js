/* ════════════════════════════════════════════
 * Wesker-MD  ╌  febry wesker
 * ════════════════════════════════════════════
 * file    : plugins/fakeq.js
 * desc    : plugins › fakeq
 * author  : febry  ⪩  2026
 * ════════════════════════════════════════════
 * © 2026 febry wesker. all rights reserved.
 * do not resell, redistribute, or claim as
 * your own work without explicit permission.
 * ────────────────────────────────────────────
 * © 2026 febry wesker. semua hak dilindungi.
 * dilarang menjual, menyebarkan, atau mengaku
 * sebagai karya sendiri tanpa izin tertulis.
 * ════════════════════════════════════════════ */

import { isFakeQEnabled, setFakeQ } from '../system/helper/fakeq.js'
import { weskerSend } from '../system/helper/wesker-message.js'

export default {
  name    : 'fakeq',
  command : ['fakeq'],
  category: ['owner'],
  description: 'toggle fake quoted (wa verified centang biru)',

  async run({ feb, m, args }) {
    const sub = args[0]

    if (!sub || sub === 'status') {
      return weskerSend(feb, m.chat,
        `fakeq status: *${isFakeQEnabled() ? 'on' : 'off'}*`,
        { quoted: m }
      )
    }

    if (sub === 'on') {
      if (isFakeQEnabled())
        return weskerSend(feb, m.chat, 'fakeq udah on', { quoted: m })
      setFakeQ(true)
      return weskerSend(feb, m.chat, 'fake quoted on', { quoted: m })
    }

    if (sub === 'off') {
      if (!isFakeQEnabled())
        return weskerSend(feb, m.chat, 'fakeq udah off', { quoted: m })
      setFakeQ(false)
      return weskerSend(feb, m.chat, 'fake quoted off', { quoted: m })
    }

    return weskerSend(feb, m.chat,
      `use\nfakeq\nfakeq status\nfakeq on\nfakeq off\n\nnote:\n• ga perlu restart`,
      { quoted: m }
    )
  }
}

