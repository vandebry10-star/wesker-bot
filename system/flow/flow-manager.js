/* ════════════════════════════════════════════
 * Wesker-MD  ╌  febry wesker
 * ════════════════════════════════════════════
 * file    : system/flow/flow-manager.js
 * desc    : system › flow › flow-manager
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
  getSession,
  setSession,
  deleteSession,
  hasSession
} from './session-store.js'

const TIMEOUT_MS = 2 * 60 * 1000   
const CONFIRM_MS = 1 * 60 * 1000   
const MAX_ERRORS = 3
const STOP_WORDS = new Set(['stopflow', 'stop flow'])

const registry   = new Map()  
const triggerMap = new Map()  

export function registerFlow(flow) {
  if (!flow?.id || typeof flow.trigger !== 'string' || !Array.isArray(flow.steps)) {
    console.warn('[FLOW] invalid flow, skip:', flow?.id)
    return false
  }
  registry.set(flow.id, flow)
  triggerMap.set(flow.trigger.trim().toLowerCase(), flow.id)
  console.log(`[FLOW] registered: ${flow.id}  trigger="${flow.trigger}"`)
  return true
}

export function unregisterFlow(flowId) {
  const flow = registry.get(flowId)
  if (!flow) return
  triggerMap.delete(flow.trigger.trim().toLowerCase())
  registry.delete(flowId)
}

export function getFlow(flowId)         { return registry.get(flowId) ?? null }
export function listFlows()             { return [...registry.values()] }
export { hasSession }

export function getFlowByTrigger(rawText) {
  const t = rawText?.trim().toLowerCase()
  const id = triggerMap.get(t)
  return id ? registry.get(id) : null
}

function buildCtx(feb, m, session, flow) {
  return {
    feb,
    m,
    chat   : m.chat,
    sender : m.sender,

    text   : session._buttonId ?? (typeof m.text === 'string' ? m.text : ''),
    
    rawText: typeof m.text === 'string' ? m.text : '',

    step : session.step,
    data : session.data,
    flow,

    set(k, v) { session.data[k] = v },
    get(k)    { return session.data[k] },

    next()   { session.step++; session.errorCount = 0 },
    finish() { session._done = true },
    error()  { session.errorCount = (session.errorCount || 0) + 1 },

    reply(text, opts = {}) {
      return feb.sendMessage(m.chat, { text, ...opts })
    }
  }
}

function scheduleTimeout(feb, sender, chat) {
  const s = getSession(sender, chat)
  if (!s) return

  clearTimeout(s._timeout)
  clearTimeout(s._confirm)

  s._timeout = setTimeout(async () => {
    const session = getSession(sender, chat)
    if (!session) return

    session.confirming = true
    session._confirm = setTimeout(async () => {
      await _destroy(feb, sender, chat, 'timeout')
    }, CONFIRM_MS)

    setSession(sender, chat, session)

    await feb.sendMessage(chat, {
      text: 'flow masih aktif, kirim pesan apapun untuk lanjut\natau tunggu 1 menit untuk keluar otomatis'
    })
  }, TIMEOUT_MS)

  setSession(sender, chat, s)
}

export async function startFlow(feb, m, flow) {
  const { sender, chat } = m

  if (!chat.endsWith('@g.us')) return false
  if (hasSession(sender, chat))  return false

  const session = {
    flowId      : flow.id,
    step        : 0,
    data        : {},
    errorCount  : 0,
    startedAt   : Date.now(),
    lastActiveAt: Date.now(),
    confirming  : false,
    _done       : false,
    _buttonId   : null,
    _timeout    : null,
    _confirm    : null
  }

  setSession(sender, chat, session)
  scheduleTimeout(feb, sender, chat)

  console.log(`[FLOW] start | ${flow.id} | ${sender}`)

  if (typeof flow.onStart === 'function') {
    try { await flow.onStart(buildCtx(feb, m, session, flow)) }
    catch (e) { console.error('[FLOW] onStart error:', e.message) }
  }

  await _runStep(feb, m, session, flow)
  return true
}

export async function handleFlowInput(feb, m, buttonId = null) {
  const { sender, chat } = m
  const session = getSession(sender, chat)
  if (!session) return false

  const text = (m.text || '').trim().toLowerCase()

  if (!buttonId && STOP_WORDS.has(text)) {
    await _destroy(feb, sender, chat, 'user_stop')
    await feb.sendMessage(chat, { text: 'flow dihentikan' })
    return true
  }

  const flow = getFlow(session.flowId)
  if (!flow) {
    await _destroy(feb, sender, chat, 'flow_not_found')
    return true
  }

  session.confirming   = false
  session.lastActiveAt = Date.now()
  session._buttonId    = buttonId  
  scheduleTimeout(feb, sender, chat)

  if (session.errorCount >= MAX_ERRORS) {
    await _destroy(feb, sender, chat, 'error_limit')
    await feb.sendMessage(chat, { text: '3x salah input, flow dihentikan' })
    return true
  }

  if (typeof flow.onStep === 'function') {
    try { await flow.onStep(buildCtx(feb, m, session, flow)) }
    catch (e) { console.error('[FLOW] onStep error:', e.message) }
  }

  await _runStep(feb, m, session, flow)
  return true
}

async function _runStep(feb, m, session, flow) {
  const step = flow.steps[session.step]

  if (!step) {
    await _finish(feb, m, session, flow)
    return
  }

  const ctx = buildCtx(feb, m, session, flow)
  const fn  = typeof step === 'function' ? step : step.run

  try {
    if (typeof fn === 'function') await fn(ctx)
  } catch (e) {
    console.error(`[FLOW] step ${session.step} error:`, e.message)
  }

  setSession(m.sender, m.chat, session)

  if (session._done) {
    await _finish(feb, m, session, flow)
  }
}

async function _finish(feb, m, session, flow) {
  if (typeof flow.onFinish === 'function') {
    try { await flow.onFinish(buildCtx(feb, m, session, flow)) }
    catch (e) { console.error('[FLOW] onFinish error:', e.message) }
  }
  deleteSession(m.sender, m.chat)
  console.log(`[FLOW] finish | ${flow.id} | ${m.sender}`)
}

async function _destroy(feb, sender, chat, reason) {
  const session = getSession(sender, chat)
  if (!session) return

  const flow = getFlow(session.flowId)
  if (flow && typeof flow.onDestroy === 'function') {
    const fakeM = { chat, sender, text: '' }
    try { await flow.onDestroy(buildCtx(feb, fakeM, session, flow)) }
    catch (e) { console.error('[FLOW] onDestroy error:', e.message) }
  }

  deleteSession(sender, chat)
  console.log(`[FLOW] destroy | ${session.flowId} | ${sender} | ${reason}`)
}

export { _destroy as destroyFlow }
