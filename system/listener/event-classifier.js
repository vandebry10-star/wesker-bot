/* ════════════════════════════════════════════
 * Wesker-MD  ╌  febry wesker
 * ════════════════════════════════════════════
 * file    : system/listener/event-classifier.js
 * desc    : system › listener › event-classifier
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

export function classifyMessage(msg) {
  if (!msg || !msg.message) {
    return { type: 'unknown', valid: false }
  }

  const message = msg.message
  const classification = {
    raw: msg,
    key: msg.key,
    types: [], 
    primary: null,
    valid: true
  }

  if (message.conversation) {
    classification.types.push('text')
    classification.primary = 'text'
  }

  if (message.extendedTextMessage) {
    classification.types.push('extended_text')
    if (!classification.primary) classification.primary = 'extended_text'
    
    if (message.extendedTextMessage.contextInfo?.stanzaId) {
      classification.types.push('quoted')
    }
  }

  if (message.imageMessage) {
    classification.types.push('image')
    if (!classification.primary) classification.primary = 'image'
  }

  if (message.videoMessage) {
    classification.types.push('video')
    if (!classification.primary) classification.primary = 'video'
  }

  if (message.audioMessage) {
    classification.types.push('audio')
    if (!classification.primary) classification.primary = 'audio'
    
    if (message.audioMessage.ptt) {
      classification.types.push('voice_note')
    }
  }

  if (message.documentMessage) {
    classification.types.push('document')
    if (!classification.primary) classification.primary = 'document'
  }

  if (message.stickerMessage) {
    classification.types.push('sticker')
    if (!classification.primary) classification.primary = 'sticker'
  }

  if (message.reactionMessage) {
    classification.types.push('reaction')
    classification.primary = 'reaction'
    classification.reaction = {
      emoji: message.reactionMessage.text,
      targetKey: message.reactionMessage.key
    }
  }

  if (message.buttonsResponseMessage) {
    classification.types.push('button_response')
    classification.primary = 'button_response'
    classification.interactive = {
      type: 'button',
      response: message.buttonsResponseMessage.selectedButtonId
    }
  }

  if (message.listResponseMessage) {
    classification.types.push('list_response')
    classification.primary = 'list_response'
    classification.interactive = {
      type: 'list',
      response: message.listResponseMessage.singleSelectReply?.selectedRowId
    }
  }

  if (message.templateButtonReplyMessage) {
    classification.types.push('template_button_response')
    classification.primary = 'template_button_response'
    classification.interactive = {
      type: 'template_button',
      response: message.templateButtonReplyMessage.selectedId
    }
  }

  if (message.interactiveResponseMessage) {
    classification.types.push('native_flow_response')
    classification.primary = 'native_flow_response'
    classification.interactive = {
      type: 'native_flow',
      response: message.interactiveResponseMessage
    }
  }

  if (message.requestPaymentMessage) {
    classification.types.push('payment_request')
    if (!classification.primary) classification.primary = 'payment_request'
  }

  if (message.orderMessage) {
    classification.types.push('order')
    if (!classification.primary) classification.primary = 'order'
  }

  if (message.productMessage) {
    classification.types.push('product')
    if (!classification.primary) classification.primary = 'product'
  }

  if (message.viewOnceMessage) {
    classification.types.push('view_once')
    
    const innerMsg = message.viewOnceMessage.message
    if (innerMsg) {
      const innerClass = classifyMessage({ ...msg, message: innerMsg })
      classification.types.push(...innerClass.types)
      if (!classification.primary) classification.primary = innerClass.primary
    }
  }

  if (message.ephemeralMessage) {
    classification.types.push('ephemeral')
    const innerMsg = message.ephemeralMessage.message
    if (innerMsg) {
      const innerClass = classifyMessage({ ...msg, message: innerMsg })
      classification.types.push(...innerClass.types)
      if (!classification.primary) classification.primary = innerClass.primary
    }
  }

  if (message.pollCreationMessage) {
    classification.types.push('poll')
    classification.primary = 'poll'
  }

  if (message.pollUpdateMessage) {
    classification.types.push('poll_update')
    classification.primary = 'poll_update'
  }

  if (message.contactMessage) {
    classification.types.push('contact')
    if (!classification.primary) classification.primary = 'contact'
  }

  if (message.contactsArrayMessage) {
    classification.types.push('contacts_array')
    if (!classification.primary) classification.primary = 'contacts_array'
  }

  if (message.locationMessage) {
    classification.types.push('location')
    if (!classification.primary) classification.primary = 'location'
  }

  if (message.liveLocationMessage) {
    classification.types.push('live_location')
    if (!classification.primary) classification.primary = 'live_location'
  }

  if (message.callLogMesssage || message.call) {
    classification.types.push('call')
    if (!classification.primary) classification.primary = 'call'
  }

  if (message.protocolMessage) {
    classification.types.push('protocol')
    classification.primary = 'protocol'
    
    const type = message.protocolMessage.type
    if (type === 0) classification.types.push('message_delete')
    if (type === 1) classification.types.push('message_revoke')
  }

  if (message.senderKeyDistributionMessage) {
    classification.types.push('sender_key_distribution')
    classification.primary = 'sender_key_distribution'
  }

  if (classification.types.length === 0) {
    classification.primary = 'unknown'
    classification.types.push('unknown')
  }

  return classification
}

export function classifyGroupEvent(update) {
  const classification = {
    type: 'group_update',
    action: null,
    valid: true,
    raw: update
  }

  if (update.announce !== undefined) {
    classification.action = update.announce ? 'group_locked' : 'group_unlocked'
  }

  if (update.restrict !== undefined) {
    classification.action = update.restrict ? 'group_restricted' : 'group_unrestricted'
  }

  if (update.subject) {
    classification.action = 'group_subject_change'
    classification.newSubject = update.subject
  }

  if (update.desc) {
    classification.action = 'group_description_change'
  }

  if (update.participants) {
    classification.action = 'group_participants_update'
    classification.participants = update.participants
  }

  return classification
}

export function classifyPresence(update) {
  if (!update || !update.presences) {
    return { type: 'presence', valid: false }
  }

  const classification = {
    type: 'presence',
    chat: update.id,
    users: [],
    valid: true,
    raw: update
  }

  for (const [jid, presence] of Object.entries(update.presences)) {
    const state = presence.lastKnownPresence
    classification.users.push({
      jid,
      state, 
      timestamp: presence.lastSeen || Date.now()
    })
  }

  return classification
}
