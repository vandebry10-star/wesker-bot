/* ════════════════════════════════════════════
 * Wesker-MD  ╌  febry wesker
 * ════════════════════════════════════════════
 * file    : plugins/access.js
 * desc    : plugins › access
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

import {
  addUser,
  removeUser,
  listAccess,
  getRole
} from '../system/helper/access.js'

import { sendNativeFlow } from '../system/helper/nativeflow.js'
import { jidNormalizedUser } from 'baileys'

const accessSession = new Map()

function normalizeJid(raw) {
  if (!raw) return null
  raw = raw.trim()

  if (raw.startsWith('@')) raw = raw.slice(1)
  if (!raw.includes('@')) raw += '@lid'

  return jidNormalizedUser(raw)
}

function extractTarget(m, args) {
  if (m.mentions?.length) return m.mentions[0]
  if (m.quoted?.sender) return m.quoted.sender
  if (args?.[0]) return normalizeJid(args[0])
  return null
}

export default {
  name: 'access',
  hidden: true,
  command: [
    'access',
    'access.set.dev',
    'access.set.user',
    'access.del'
  ],
  category: ['dev'],
  description: 'your access management to get started',

  async run({ feb, command, m, args }) {
    const chat = m.chat
    const sender = m.sender

    if (command === 'access') {
      const target = extractTarget(m, args)

      if (target) {
        accessSession.set(sender, target)

        return sendNativeFlow(feb, chat, {
          messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2
          },
          interactiveMessage: {
            header: { title: 'manage access' },
            body: {
              text:
                `to:\n@${target.split('@')[0]}`
            },
            contextInfo: {
              mentionedJid: [target],
              stanzaId: m.id,
              participant: m.sender,
              quotedMessage: m.raw.message
            },
            nativeFlowMessage: {
              buttons: [
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({
                    display_text: 'set dev',
                    id: 'access.set.dev'
                  })
                },
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({
                    display_text: 'set user',
                    id: 'access.set.user'
                  })
                },
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({
                    display_text: 'delete access',
                    id: 'access.del'
                  })
                }
              ]
            }
          }
        })
      }

      const data = listAccess()
      const entries = Object.entries(data)

      if (!entries.length) {
        return m.reply('belum ada user terdaftar')
      }

      let text = '*list akses*\n\n'
      entries.forEach(([jid, role], i) => {
        text += `${i + 1}. ${jid.replace(/@.+$/, '')}\n`
        text += `   lid : ${jid}\n`
        text += `   role: ${role}${i === 0 ? ' (DEV INTI)' : ''}\n\n`
      })

      text +=
        '\nnote:\n' +
        '• index 1 adalah dev inti\n' +
        '• tidak bisa dihapus'

      return m.reply(text.trim())
    }

    const target = accessSession.get(sender)
    if (!target) {
      return m.reply('target tidak valid')
    }

    const data = listAccess()
    const entries = Object.keys(data)

    if (
      command === 'access.del' &&
      entries[0] === target
    ) {
      return m.reply('dev inti tidak bisa dihapus')
    }

    if (command === 'access.set.dev') {
      addUser(target, 'dev')
      accessSession.delete(sender)
      return m.reply(`akses dev diberikan\n${target}`)
    }

    if (command === 'access.set.user') {
      addUser(target, 'user')
      accessSession.delete(sender)
      return m.reply(`akses user diberikan\n${target}`)
    }

    if (command === 'access.del') {
      removeUser(target)
      accessSession.delete(sender)
      return m.reply(`akses dihapus.\n${target}`)
    }
  }
}