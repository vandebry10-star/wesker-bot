/* ════════════════════════════════════════════
 * Wesker-MD  ╌  febry wesker
 * ════════════════════════════════════════════
 * file    : plugins/help.js
 * desc    : plugins › help
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

import crypto from 'node:crypto'
import fetch from 'node-fetch'

const DEFAULT_THUMB =
  'https://cdn.azbry.my.id/uploads/wesker.jpg'

async function getThumbBuffer(url) {
  try {
    const res = await fetch(url)
    if (!res.ok) throw 0
    return Buffer.from(await res.arrayBuffer())
  } catch {
    return null
  }
}

export default {
  name: 'help',
  command: ['help'],
  category: ['main'],
  description: 'tampilkan daftar command + detail',

  async run({ feb, m, raw, args, wesker, other }) {
    const pm = wesker
    if (!pm) return

    const plugins = pm.getAllPlugins()

    if (args[0]) {
      const target = args[0].toLowerCase()

      const plugin = plugins.find(p =>
        Array.isArray(p.command) &&
        p.command.includes(target)
      )

      if (!plugin) {
        return feb.relayMessage(
          m.chat,
          {
            extendedTextMessage: {
              text: 'command tidak ditemukan'
            }
          },
          {
            messageId: crypto.randomUUID(),
            quoted: raw
          }
        )
      }

      const thumbUrl =
        plugin.thumbnail || DEFAULT_THUMB

      const thumb =
        (await getThumbBuffer(thumbUrl)) ||
        (await getThumbBuffer(DEFAULT_THUMB))

      const text =
`• command   : ${plugin.command[0]}
• category  : ${plugin.category?.[0] || 'other'}
• aliases   : ${plugin.command.join(', ')}

• description:
${plugin.description || 'tidak ada deskripsi'}`

      return feb.relayMessage(
        m.chat,
        {
          extendedTextMessage: {
            text,
            contextInfo: {
              externalAdReply: {
                title: 'seven minutes',
                body: 'informasi command',
                mediaType: 1,
                thumbnail: thumb
              }
            }
          }
        },
        {
          messageId: crypto.randomUUID(),
          quoted: raw
        }
      )
    }

    let text = 'command information'
    const map = new Map()

    for (const p of plugins) {
      const cat =
        (p.category?.[0] || 'other').toLowerCase()
      if (!map.has(cat)) map.set(cat, [])
      map.get(cat).push(p)
    }

    for (const [cat, list] of [...map.entries()].sort()) {
      text += `❯ ${cat}\n`
      for (const p of list.sort((a, b) =>
        a.command[0].localeCompare(b.command[0])
      )) {
        text += `• ${p.command[0]}\n`
        text += `  └ ${p.description || 'no desc'}\n`
      }
      text += '\n'
    }

    text += 'ketik help <command> untuk detail'

    return feb.relayMessage(
      m.chat,
      {
        extendedTextMessage: {
          text
        }
      },
      {
        messageId: crypto.randomUUID(),
        quoted: raw
      }
    )
  }
}