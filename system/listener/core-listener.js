/* ════════════════════════════════════════════
 * Wesker-MD  ╌  febry wesker
 * ════════════════════════════════════════════
 * file    : system/listener/core-listener.js
 * desc    : system › listener › core-listener
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
  classifyMessage,
  classifyGroupEvent,
  classifyPresence
} from './event-classifier.js'

import {
  logMessageEvent,
  logGroupEvent,
  logPresenceEvent,
  logReactionEvent,
  consoleLog
} from './event-logger.js'

export class CoreListener {
  constructor(feb) {
    this.feb = feb
    this.isActive = true
    this.stats = {
      messages: 0,
      reactions: 0,
      groups: 0,
      presence: 0,
      calls: 0,
      unknown: 0
    }
  }

  activate() {
    this.isActive = true
    this.registerAllListeners()
    consoleLog('core-listener', 'listeners activated')
  }

  deactivate() {
    this.isActive = false
    consoleLog('core-listener', 'listeners deactivated')
  }

  registerAllListeners() {
    const feb = this.feb

    feb.ev.on('messages.upsert', d => {
      if (!this.isActive) return
      this.handleMessagesUpsert(d)
    })

    feb.ev.on('messages.update', d => {
      if (!this.isActive) return
      this.handleMessagesUpdate(d)
    })

    feb.ev.on('messages.delete', d => {
      if (!this.isActive) return
      this.handleMessagesDelete(d)
    })

    feb.ev.on('messages.reaction', d => {
      if (!this.isActive) return
      this.handleMessagesReaction(d)
    })

    feb.ev.on('groups.upsert', d => {
      if (!this.isActive) return
      this.handleGroupsUpsert(d)
    })

    feb.ev.on('groups.update', d => {
      if (!this.isActive) return
      this.handleGroupsUpdate(d)
    })

    feb.ev.on('group-participants.update', d => {
      if (!this.isActive) return
      this.handleGroupParticipantsUpdate(d)
    })

    feb.ev.on('presence.update', d => {
      if (!this.isActive) return
      this.handlePresenceUpdate(d)
    })

    feb.ev.on('chats.upsert', d => {
      if (!this.isActive) return
      this.handleChatsUpsert(d)
    })

    feb.ev.on('chats.update', d => {
      if (!this.isActive) return
      this.handleChatsUpdate(d)
    })

    feb.ev.on('chats.delete', d => {
      if (!this.isActive) return
      this.handleChatsDelete(d)
    })

    feb.ev.on('contacts.upsert', d => {
      if (!this.isActive) return
      this.handleContactsUpsert(d)
    })

    feb.ev.on('contacts.update', d => {
      if (!this.isActive) return
      this.handleContactsUpdate(d)
    })

    feb.ev.on('call', d => {
      if (!this.isActive) return
      this.handleCall(d)
    })

    feb.ev.on('blocklist.set', d => {
      if (!this.isActive) return
      this.handleBlocklistSet(d)
    })

    feb.ev.on('blocklist.update', d => {
      if (!this.isActive) return
      this.handleBlocklistUpdate(d)
    })

    feb.ev.on('connection.update', d => {
      if (!this.isActive) return
      this.handleConnectionUpdate(d)
    })

    feb.ev.on('creds.update', () => {})
  }

  handlePresenceUpdate(update) {
    try {
      this.stats.presence++

      const c = classifyPresence(update)
      if (!c.valid) return

      logPresenceEvent(c)
    } catch (err) {
      consoleLog('error', 'presence.update failed', err.message)
    }
  }

  handleMessagesUpsert({ messages }) {
    this.stats.messages += messages.length

    for (const msg of messages) {
      if (!msg?.key) continue

      const c = classifyMessage(msg)
      if (!c.valid) continue

      logMessageEvent(c)

      if (c.primary === 'reaction' && c.reaction) {
        this.stats.reactions++
        logReactionEvent({
          emoji: c.reaction.emoji,
          sender: msg.key.participant || msg.key.remoteJid,
          chat: msg.key.remoteJid,
          key: c.reaction.targetKey
        })
      }
    }
  }

  handleMessagesUpdate() {}
  handleMessagesDelete() {}
  handleMessagesReaction() {}
  handleGroupsUpsert() {}
  handleGroupsUpdate(u) { u.forEach(x => logGroupEvent(classifyGroupEvent(x))) }
  handleGroupParticipantsUpdate() {}
  handleChatsUpsert() {}
  handleChatsUpdate() {}
  handleChatsDelete() {}
  handleContactsUpsert() {}
  handleContactsUpdate() {}
  handleCall() {}
  handleBlocklistSet() {}
  handleBlocklistUpdate() {}
  handleConnectionUpdate(u) {
    if (u.connection) consoleLog('connection', u.connection)
  }

  getStats() {
    return { ...this.stats }
  }

  resetStats() {
    this.stats = {
      messages: 0,
      reactions: 0,
      groups: 0,
      presence: 0,
      calls: 0,
      unknown: 0
    }
    consoleLog('core-listener', 'Stats reset')
  }
}