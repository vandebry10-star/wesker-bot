/* ════════════════════════════════════════════
 * Wesker-MD  ╌  febry wesker
 * ════════════════════════════════════════════
 * file    : plugins/e.js
 * desc    : plugins › e
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

import { createRequire } from 'node:module'
import { inspect } from 'node:util'

const _require = createRequire(import.meta.url)

export default {
  name    : 'eval',
  hidden  : false,
  command : ['e'],
  category: ['owner'],
  description: 'eval our code',

  async run({ feb, m, args, other, raw, chat, sender, role }) {
    const code = args.join(' ').trim()
    if (!code) return m.reply('ngapain?')

    const store = other?.storeMessage
    const q     = m.quoted || null

    function pp(val, depth = 3) {
      if (val === undefined)       return 'undefined'
      if (val === null)            return 'null'
      if (typeof val === 'string') return val
      if (val instanceof Error)    return `${val.name}: ${val.message}`
      if (typeof val === 'function') return `[Function: ${val.name || 'anonymous'}]`
      return inspect(val, { depth, colors: false, maxArrayLength: 20 })
    }

    try {
      const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor

      const fn = new AsyncFunction(
        'feb',   
        'm',      
        'q',      
        'other',  
        'store',  
        'args',   
        'raw',    
        'chat',   
        'sender', 
        'role',   
        'pp',     
        'require',
        `
        try {
          const __r = (${code})
          if (__r instanceof Promise) return await __r
          return __r
        } catch (__e) {
          return __e
        }
        `
      )

      const result = await fn(
        feb, m, q, other, store,
        args, raw, chat, sender, role,
        pp, _require
      )

      const out = pp(result)

      const MAX = 3500
      const text = out.length > MAX
        ? out.slice(0, MAX) + `\n\n... [+${out.length - MAX} chars]`
        : out

      return m.reply(text)

    } catch (e) {
      return m.reply(`fatal: ${e.message}`)
    }
  }
}
