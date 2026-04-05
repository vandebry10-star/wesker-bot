/* ════════════════════════════════════════════
 * Wesker-MD  ╌  febry wesker
 * ════════════════════════════════════════════
 * file    : plugins/menu.js
 * desc    : plugins › menu
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

import { sendNativeFlow } from '../system/helper/nativeflow.js'
import { formatSeconds }  from '../system/helper/index.js'

export default {
  name   : 'menu',
  command: ['menu', 'm'],
  category: ['main'],
  description: 'daftar perintah berdasarkan kategori',

  async run({ feb, m, chat, wesker }) {
    if (!wesker) return m.reply('plugin manager tidak tersedia')

    const plugins = wesker.getAllPlugins().filter(p =>
      !p.hidden && !p.noMenu && !p.category?.includes('hidden') &&
      Array.isArray(p.command) && p.command[0]
    )

    // kelompokkan per kategori
    const map = new Map()
    for (const p of plugins) {
      const cat = (p.category?.[0] || 'other').toLowerCase()
      if (!map.has(cat)) map.set(cat, [])
      map.get(cat).push(p)
    }

    const sortedCats = [...map.keys()].sort()
    const totalCmd   = plugins.length

    // build sections untuk list message
    const sections = sortedCats.map(cat => {
      const list = map.get(cat).sort((a, b) => a.command[0].localeCompare(b.command[0]))
      return {
        title: cat.toUpperCase(),
        rows : list.map(p => ({
          header     : p.command[0],
          title      : p.command[0],
          description: p.description
            ? p.description.split('\n')[0].slice(0, 72)
            : `alias: ${p.command.slice(1).join(', ') || '-'}`,
          id: p.command[0]
        }))
      }
    })

    const uptime = formatSeconds(Math.floor(process.uptime()))

    const msg = {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            header: {
              title             : 'wesker md',
              hasMediaAttachment: false
            },
            body: {
              text:
                `total command : ${totalCmd}\n` +
                `kategori      : ${sortedCats.length}\n` +
                `uptime        : ${uptime}\n\n` +
                `pilih kategori untuk lihat command`
            },
            footer: { text: 'wesker • menu' },
            nativeFlowMessage: {
              buttons: [
                {
                  name: 'single_select',
                  buttonParamsJson: JSON.stringify({
                    title   : 'pilih kategori',
                    sections: sections
                  })
                }
              ],
              messageParamsJson: JSON.stringify({
                in_thread_buttons_limit: 1
              })
            }
          }
        }
      }
    }

    await sendNativeFlow(feb, chat, msg, { quoted: m })
  }
}

