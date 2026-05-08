/* ════════════════════════════════════════════
 * Wesker-MD  ╌  febry wesker
 * ════════════════════════════════════════════
 * file    : system/manager/plugin.js
 * desc    : system › manager › plugin
 * author  : febry  ⪩  2026
 * ════════════════════════════════════════════
 * © 2026 febry wesker. all rights reserved.
 * do not resell, redistribute, or claim as
 * your own work without explicit permission.
 * ════════════════════════════════════════════ */

import fs   from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getRole }       from '../helper/access.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const c = {
  reset : '\x1b[0m',
  dim   : '\x1b[90m',
  white : '\x1b[97m',
  green : '\x1b[32m',
  red   : '\x1b[31m',
  yellow: '\x1b[33m',
}

const log  = (msg) => process.stdout.write(`  ${c.dim}⟡${c.reset} ${msg}\n`)
const ok   = (msg) => log(`${c.green}${msg}${c.reset}`)
const warn = (msg) => log(`${c.yellow}${msg}${c.reset}`)
const err  = (msg) => log(`${c.red}${msg}${c.reset}`)

function formatError(e) {
  if (!e) return 'unknown error'

  const message = (e.message || e.toString() || 'unknown error').trim()

  const stackLines   = (e.stack || '').split('\n')
  const relevantLine = stackLines.find(l =>
    l.includes('at ') &&
    !l.includes('node:') &&
    !l.includes('node_modules') &&
    (l.includes('.js') || l.includes('.mjs'))
  )

  let location = ''
  if (relevantLine) {
    const match = relevantLine.match(/\(?(file:\/\/\/|\/)?([^\s(]+\.m?js):(\d+):(\d+)\)?/)
    if (match) {
      const filePath = match[2].replace(/.*wesker\//, '')
      location = `${filePath}:${match[3]}:${match[4]}`
    }
  }

  return location
    ? `${message}\n⟡ lokasi : ${location}`
    : message.slice(0, 300)
}

function checkAccess(plugin, role) {
  if (!role) return false
  if (plugin.category?.includes('owner') && role !== 'owner') return false
  return true
}

// scan rekursif — support flat plugins/ dan subfolder plugins/dev/, plugins/tools/, dll
function scanPlugins(dir) {
  const result = []
  if (!fs.existsSync(dir)) return result
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      result.push(...scanPlugins(full))
    } else if (entry.name.endsWith('.js') && !entry.name.startsWith('_')) {
      result.push(full) // full absolute path
    }
  }
  return result
}

export default class PluginManager {
  constructor() {
    this.plugins       = new Map()
    this.commandMap    = new Map()
    this.disabled      = new Set()
    this.pluginsDir    = path.join(__dirname, '../../plugins')
    this._reloadTimers = new Map()
  }

  async loadPlugins() {
    if (!fs.existsSync(this.pluginsDir)) {
      fs.mkdirSync(this.pluginsDir, { recursive: true })
      warn('plugins dir created')
      return
    }

    // scan rekursif — dapat absolute path per file
    const files = scanPlugins(this.pluginsDir)
    for (const filePath of files) await this._loadSinglePlugin(filePath)

    log(`${c.dim}${this.plugins.size} plugins loaded${c.reset}`)
  }

  // filePath sekarang bisa berupa absolute path atau filename saja (dari watchPlugins/reloadPlugin)
  async _loadSinglePlugin(filePath) {
    // normalise: kalau bukan absolute path, resolve dari pluginsDir
    const absPath = path.isAbsolute(filePath)
      ? filePath
      : path.join(this.pluginsDir, filePath)

    // key di Map pakai path relatif dari pluginsDir supaya unik antar subfolder
    const relKey = path.relative(this.pluginsDir, absPath)

    try {
      const imported = await import(`file://${absPath}?update=${Date.now()}`)
      const plugin   = imported.default

      if (!this.validatePlugin(plugin)) {
        warn(`skip ${relKey} · invalid structure`)
        return
      }

      if (path.basename(absPath).startsWith('_')) plugin.hidden = true
      plugin.__file = relKey

      this.plugins.set(relKey, plugin)
      for (const cmd of plugin.command) this.commandMap.set(cmd, relKey)
    } catch (e) {
      err(`load error ${relKey} · ${formatError(e)}`)
    }
  }

  watchPlugins() {
    if (!fs.existsSync(this.pluginsDir)) return

    // watch rekursif semua subfolder juga
    this._watchDir(this.pluginsDir)
  }

  _watchDir(dir) {
    fs.watch(dir, (_, filename) => {
      if (!filename?.endsWith('.js')) return
      const absPath = path.join(dir, filename)
      const relKey  = path.relative(this.pluginsDir, absPath)

      clearTimeout(this._reloadTimers.get(relKey))
      this._reloadTimers.set(relKey, setTimeout(() => {
        this._reloadTimers.delete(relKey)
        this.reloadPlugin(absPath) // pass absolute path
      }, 300))
    })

    // watch subfolder juga
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) this._watchDir(path.join(dir, entry.name))
    }
  }

  async reloadPlugin(filePath) {
    const absPath = path.isAbsolute(filePath)
      ? filePath
      : path.join(this.pluginsDir, filePath)

    const relKey = path.relative(this.pluginsDir, absPath)

    if (!fs.existsSync(absPath)) {
      this._unregisterPlugin(relKey)
      log(`${c.dim}removed · ${relKey}${c.reset}`)
      return
    }

    try {
      const imported = await import(`file://${absPath}?update=${Date.now()}`)
      const plugin   = imported.default

      if (!this.validatePlugin(plugin)) {
        warn(`reload skip · ${relKey} · invalid structure`)
        return
      }

      this._unregisterPlugin(relKey)

      if (path.basename(absPath).startsWith('_')) plugin.hidden = true
      plugin.__file = relKey

      this.plugins.set(relKey, plugin)
      for (const cmd of plugin.command) this.commandMap.set(cmd, relKey)

      ok(`reloaded · ${plugin.name} · ${relKey}`)
    } catch (e) {
      err(`reload error · ${relKey} · ${formatError(e)}`)
    }
  }

  _unregisterPlugin(relKey) {
    this.plugins.delete(relKey)
    for (const [cmd, file] of this.commandMap.entries()) {
      if (file === relKey) {
        this.commandMap.delete(cmd)
        this.disabled.delete(cmd)
      }
    }
  }

  validatePlugin(plugin) {
    return (
      plugin &&
      typeof plugin.name    === 'string' &&
      Array.isArray(plugin.command)      &&
      typeof plugin.run     === 'function'
    )
  }

  disable(cmd)    { this.disabled.add(cmd) }
  enable(cmd)     { this.disabled.delete(cmd) }
  isDisabled(cmd) { return this.disabled.has(cmd) }

  getPlugin(command) {
    const file = this.commandMap.get(command)
    return file ? this.plugins.get(file) : null
  }

  getAllPlugins()     { return Array.from(this.plugins.values()) }
  getPublicPlugins() { return Array.from(this.plugins.values()).filter(p => !p.hidden) }
  getPluginCount()   { return this.plugins.size }

  async executePlugin(command, ctx) {
    if (this.isDisabled(command)) return null

    const plugin = this.getPlugin(command)
    if (!plugin) return null

    const sender = ctx?.sender || ctx?.m?.sender
    if (!sender) return null

    const role = ctx?.role ?? getRole(sender)
    if (!role) return false

    if (!checkAccess(plugin, role)) {
      if (ctx?.reply) await ctx.reply('akses ditolak').catch(() => {})
      return false
    }

    try {
      await plugin.run(ctx)
      return true
    } catch (e) {
      const msg = formatError(e)
      if (ctx?.react) await ctx.react('❌').catch(() => {})
      if (ctx?.reply) {
        await ctx.reply(
          `lahh error..\n\n` +
          `⟡ plugin : ${plugin.name}\n` +
          `⟡ error  : ${e.message?.split('\n')[0] || 'unknown'}\n` +
          `⟡ lokasi : ${(() => {
            const line = (e.stack || '').split('\n').find(l =>
              l.includes('at ') && !l.includes('node:') &&
              !l.includes('node_modules') && l.includes('.js')
            )
            const match = line?.match(/\(?(file:\/\/\/)?([^\s(]+\.m?js):(\d+)/)
            return match ? match[2].replace(/.*wesker\//, '') + ':' + match[3] : 'unknown'
          })()}`
        ).catch(() => {})
      }
      err(`plugin error · ${plugin.name} · ${msg}`)
      return false
    }
  }
}