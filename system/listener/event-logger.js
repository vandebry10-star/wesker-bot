/* ════════════════════════════════════════════
 * Wesker-MD  ╌  febry wesker
 * ════════════════════════════════════════════
 * file    : system/listener/event-logger.js
 * desc    : system › listener › event-logger
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

import fs from 'fs'
import path from 'path'
import { isDebug } from '../helper/debug.js'

const LOG_DIR = path.resolve('./system/cache/listener-logs')
const MAX_LOG_SIZE = 1000

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true })
}

export function logEvent(category, data) {
  try {
    const logFile = path.join(LOG_DIR, `${category}.json`)

    let logs = []
    if (fs.existsSync(logFile)) {
      const content = fs.readFileSync(logFile, 'utf-8')
      logs = JSON.parse(content)
    }

    logs.push({
      timestamp: new Date().toISOString(),
      ...data
    })

    if (logs.length > MAX_LOG_SIZE) {
      logs = logs.slice(-MAX_LOG_SIZE)
    }

    fs.writeFileSync(logFile, JSON.stringify(logs, null, 2))
  } catch (err) {
    console.error('[LOG ERROR]', category, err.message)
  }
}

function formatInline(data) {
  if (!data || typeof data !== 'object') return ''

  return Object.entries(data)
    .map(([key, value]) => {
      if (value === null || value === undefined) return null
      if (typeof value === 'object') return null
      return `${key}=${value}`
    })
    .filter(Boolean)
    .join(' ')
}

export function consoleLog(category, message, data = null) {
  if (!isDebug()) return

  const timestamp = new Date().toLocaleTimeString('id-ID')
  const tag = category.toUpperCase().padEnd(9)

  const inline = formatInline(data)
  const suffix = inline ? ` | ${inline}` : ''

  console.log(`[${timestamp}] [${tag}] ${message}${suffix}`)
}

export function logMessageEvent(classification) {
  const { primary, types, key } = classification

  const logData = {
    id: key?.id,
    from: key?.remoteJid,
    fromMe: key?.fromMe,
    participant: key?.participant,
    primary,
    types: types.join(', ')
  }

  consoleLog('message', `${primary} detected`, {
    id: logData.id?.substring(0, 10),
    from: logData.from?.split('@')[0],
    types: logData.types
  })

  logEvent('messages', logData)
}

export function logGroupEvent(classification) {
  const { action, raw } = classification

  const logData = {
    id: raw?.id,
    action,
    announce: raw?.announce,
    restrict: raw?.restrict,
    subject: raw?.subject,
    participants: raw?.participants
  }

  consoleLog('group', action || 'unknown', {
    id: logData.id?.split('@')[0],
    action
  })

  logEvent('groups', logData)
}

export function logPresenceEvent(classification) {
  if (!isDebug()) return

  const { chat, users } = classification

  consoleLog('presence', `${users.length} user(s) activity`, {
    chat: chat?.split('@')[0],
    states: users.map(u => `${u.jid.split('@')[0]}:${u.state}`).join(', ')
  })
  
}

export function logReactionEvent(reaction) {
  const logData = {
    emoji: reaction.emoji,
    sender: reaction.sender?.split('@')[0],
    chat: reaction.chat?.split('@')[0],
    targetId: reaction.key?.id?.substring(0, 10)
  }

  consoleLog('reaction', `${reaction.emoji} from ${logData.sender}`, logData)

  logEvent('reactions', logData)
}

export function logUnknownEvent(eventName, data) {
  consoleLog('unknown', `Event: ${eventName}`, {
    keys: Object.keys(data || {})
  })

  logEvent('unknown', {
    event: eventName,
    data: JSON.stringify(data).substring(0, 200)
  })
}