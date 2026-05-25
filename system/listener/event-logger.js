// wesker-bot · febry.is-a.dev · github.com/vandebry10-star/wesker-bot


import { isDebug } from '../helper/debug.js'

const MAX_LOG_SIZE = 1000
const buffers = new Map()

export function logEvent(category, data) {
  let arr = buffers.get(category)
  if (!arr) {
    arr = []
    buffers.set(category, arr)
  }

  arr.push({ timestamp: new Date().toISOString(), ...data })

  if (arr.length > MAX_LOG_SIZE) arr.splice(0, arr.length - MAX_LOG_SIZE)
}

export function getLogs(category) {
  return buffers.get(category)?.slice() ?? []
}

export function clearLogs(category) {
  if (category) buffers.delete(category)
  else buffers.clear()
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