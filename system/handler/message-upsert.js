/* ════════════════════════════════════════════
 * Wesker-MD  ╌  febry wesker
 * ════════════════════════════════════════════
 * file    : system/handler/message-upsert.js
 * desc    : system › handler › message-upsert
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

import serialize              from '../serialize.js'
import { messageStore }       from '../store/message-store.js'
import { extractCommand }     from '../helper/util.js'
import { jidNormalizedUser }  from 'baileys'
import { getRole }            from '../helper/access.js'
import { isLocked }           from '../helper/lock.js'
import { isDebug }            from '../helper/debug.js'
import { patchFeb }           from '../helper/feb-patch.js'
import { getReactionCmdDB }   from '../helper/reaction-cmd.js'
import { isFakeQEnabled }     from '../helper/fakeq.js'
import {
  hasSession,
  handleFlowInput,
  getFlowByTrigger,
  startFlow
} from '../flow/flow-manager.js'

export async function handleMessageUpsert(feb, messages) {
  for (const msg of messages) {
    try {
      if (!msg?.key || !msg.message) continue

      const chat      = msg.key.remoteJid
      const senderRaw = msg.key.fromMe
        ? feb.user?.id
        : msg.key.participant || chat

      const sender = jidNormalizedUser(senderRaw)

      if (typeof msg.key.id === 'string') {
        messageStore.add(msg.key.id, { raw: msg })
      }

      const m = await serialize(feb, msg, messageStore)
      if (!m) continue

      const rawMsg =
        msg.message?.viewOnceMessage?.message ||
        msg.message?.ephemeralMessage?.message ||
        msg.message

      /* ─ quick reply / native flow ─ */
      const quickTemplate   = rawMsg?.templateButtonReplyMessage
      const quickNativeFlow = rawMsg?.interactiveResponseMessage?.nativeFlowResponseMessage
      const quick = quickTemplate || quickNativeFlow

      if (quick) {
        let id = quick.selectedId

        if (!id && quick.paramsJson) {
          try {
            const parsed = JSON.parse(quick.paramsJson)
            id = parsed.selectedRowId || parsed.id
          } catch (e) {
            if (isDebug()) console.log('[QUICK REPLY] paramsJson parse error:', e.message)
          }
        }

        if (id) {
          const command = id.split(/\s+/)[0]
          const args    = id.split(/\s+/).slice(1)
          const plugin  = feb.pluginManager.getPlugin(command)

          if (!plugin && hasSession(sender, chat)) {
            await handleFlowInput(feb, m, id)
            continue
          }

          if (plugin) {
            m.text = id
            const role = getRole(sender)
            if (!role) continue

            const patchedFeb = patchFeb(feb, m)

            await feb.pluginManager.executePlugin(command, {
              feb    : patchedFeb,
              wesker : feb.pluginManager,
              command,
              args,
              prefix     : '',
              commandText: id,
              m,
              raw    : msg,
              q      : m.quoted || null,
              chat   : m.chat,
              sender : m.sender,
              isGroup: m.isGroup,
              reply  : m.reply,
              react  : m.react,
              role,
              other: {
                storeMessage : messageStore,
                pluginManager: feb.pluginManager,
                wesker       : feb.pluginManager,
                triggeredBy  : 'quick_reply'
              }
            })

            continue
          }
        }
      }

      const safeText = typeof m.text === 'string' ? m.text : ''

      m.target = {
        key     : m.raw.key,
        raw     : m.raw,
        message : m.raw.message,
        sender  : m.sender,
        pushName: m.raw.pushName || null,
        isSelf  : true
      }

      const quoted = m.quoted?.raw
      if (quoted?.key) {
        const quotedFromMe =
          quoted.key.fromMe === true ||
          quoted.key.participant === feb.user?.id

        if (!quotedFromMe) {
          m.target = {
            key     : quoted.key,
            raw     : quoted,
            message : quoted.message,
            sender  : quoted.key.participant || quoted.key.remoteJid,
            pushName: quoted.pushName || null,
            isSelf  : false
          }
        }
      }

      const stored = messageStore.get(msg.key.id)
      if (stored) stored.serialized = m

      /* ─ reaction handler ─ */
      if (msg.message?.reactionMessage) {
        const reactMsg  = msg.message.reactionMessage
        const emoji     = reactMsg.text
        const targetKey = reactMsg.key

        if (isDebug()) console.log('[REACTION]', emoji, 'from', sender, 'targetId', targetKey.id)

        // ❌ = delete bot message
        if (emoji === '❌') {
          const targetDoc    = messageStore.get(targetKey.id)
          const isBotMessage =
            reactMsg.key?.fromMe === true ||
            reactMsg.key?.participant === feb.user?.id ||
            targetDoc?.raw?.key?.fromMe === true

          if (isBotMessage) {
            await feb.sendMessage(chat, { delete: targetKey })
            if (isDebug()) console.log('[REACT-DELETE] deleted:', targetKey.id)
            continue
          }
        }

        // rcmd — reaction command
        const role = getRole(sender)
        if (role !== 'owner') {
          if (isDebug()) console.log('[RCMD] bukan owner, skip')
          continue
        }

        const db      = getReactionCmdDB()
        const cmdText = db[emoji]
        if (!cmdText) {
          if (isDebug()) console.log('[RCMD] emoji tidak terdaftar:', emoji)
          continue
        }

        const targetStored = messageStore.get(targetKey.id)
        if (!targetStored?.serialized) {
          if (isDebug()) console.log('[RCMD] pesan target tidak ditemukan di store')
          continue
        }

        const targetM            = targetStored.serialized
        const [command, ...args] = cmdText.split(/\s+/)
        const plugin             = feb.pluginManager.getPlugin(command)

        if (!plugin) {
          if (isDebug()) console.log('[RCMD] plugin tidak ditemukan:', command)
          continue
        }

        targetM.text = cmdText

        if (!Object.getOwnPropertyDescriptor(targetM, 'quoted')?.get) {
          Object.defineProperty(targetM, 'quoted', {
            configurable: true,
            enumerable  : false,
            get() {
              return {
                ...targetM,
                raw    : targetM.raw,
                message: targetM.raw?.message
              }
            }
          })
        }

        const patchedFeb = patchFeb(feb, targetM)

        await feb.pluginManager.executePlugin(command, {
          feb    : patchedFeb,
          wesker : feb.pluginManager,
          command,
          args,
          prefix     : '',
          commandText: cmdText,
          m      : targetM,
          raw    : targetM.raw,
          q      : targetM.quoted,
          chat   : targetM.chat,
          sender,
          isGroup: targetM.isGroup,
          reply  : targetM.reply,
          react  : targetM.react,
          role,
          other: {
            storeMessage : messageStore,
            pluginManager: feb.pluginManager,
            wesker       : feb.pluginManager,
            triggeredBy  : 'reaction'
          }
        })

        if (isDebug()) console.log('[RCMD] done:', cmdText)
        continue
      }

      /* ─ lock ─ */
      if (isLocked()) {
        const t = safeText.trim()
        if (t !== 'lock' && t !== 'unlock') continue
      }

      /* ─ flow ─ */
      if (safeText && chat.endsWith('@g.us')) {
        const flowRole = getRole(sender)
        const canFlow  = flowRole === 'owner' || flowRole === 'owner'

        if (canFlow) {
          if (hasSession(sender, chat)) {
            await handleFlowInput(feb, m, null)
            continue
          }

          const flow = getFlowByTrigger(safeText)
          if (flow) {
            await startFlow(feb, m, flow)
            continue
          }
        }
      }

      /* ─ command dispatch ─ */
      const prefixes = feb.prefixManager.getAll()
      let extracted  = extractCommand(safeText, prefixes)

      if (!extracted) {
        const text = typeof safeText === 'string' ? safeText.trim() : ''
        if (!text) continue

        const [cmd, ...args] = text.split(/\s+/)
        const plugin = feb.pluginManager.getPlugin(cmd)
        if (plugin?.command?.includes(cmd)) {
          extracted = { command: cmd, args, prefix: '', text }
        }
      }

      if (!extracted) continue
      if (feb.pluginManager.isDisabled(extracted.command)) continue

      const plugin = feb.pluginManager.getPlugin(extracted.command)
      if (!plugin) continue

      const role = getRole(sender)
      if (!role) continue

      if (plugin.category?.includes('owner') && role !== 'owner') {
        await m.reply('khusus owner')
        continue
      }

      const patchedFeb = patchFeb(feb, m)

      await feb.pluginManager.executePlugin(extracted.command, {
        feb    : patchedFeb,
        wesker : feb.pluginManager,
        command: extracted.command,
        args   : extracted.args,
        prefix : extracted.prefix,
        commandText: extracted.text,
        m,
        raw    : msg,
        q      : m.quoted || null,
        chat   : m.chat,
        sender : m.sender,
        isGroup: m.isGroup,
        reply  : m.reply,
        react  : m.react,
        role,
        other: {
          storeMessage : messageStore,
          pluginManager: feb.pluginManager,
          wesker       : feb.pluginManager,
        }
      })

    } catch (err) {
      console.error('[UPSERT ERROR]', err)
    }
  }
}
