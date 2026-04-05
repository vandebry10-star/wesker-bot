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
 * ────────────────────────────────────────────
 * © 2026 febry wesker. semua hak dilindungi.
 * dilarang menjual, menyebarkan, atau mengaku
 * sebagai karya sendiri tanpa izin tertulis.
 * ════════════════════════════════════════════ */

import fs   from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getRole }       from '../helper/access.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const c = {
  reset: '\x1b[0m',
  dim  : '\x1b[90m',
  white: '\x1b[97m',
  green: '\x1b[32m',
  red  : '\x1b[31m',
  yellow:'\x1b[33m',
}

const log  = (msg) => process.stdout.write(`  ${c.dim}⟡${c.reset} ${msg}\n`)
const ok   = (msg) => log(`${c.green}${msg}${c.reset}`)
const warn = (msg) => log(`${c.yellow}${msg}${c.reset}`)
const err  = (msg) => log(`${c.red}${msg}${c.reset}`)

function formatError(e) {
  if (!e) return 'unknown error'
  return (e.message || e.toString() || 'unknown error').split('\n')[0].trim().slice(0, 300)
}

function checkAccess(plugin, role) {
  if (!role) return false
  if (plugin.category?.includes('dev') && role !== 'dev') return false
  return true
}

export default class PluginManager {
  constructor() {
    this.plugins      = new Map()
    this.commandMap   = new Map()
    this.disabled     = new Set()
    this.pluginsDir   = path.join(__dirname, '../../plugins')
    this._reloadTimers = new Map()
  }

  async loadPlugins() {
    if (!fs.existsSync(this.pluginsDir)) {
      fs.mkdirSync(this.pluginsDir, { recursive: true })
      warn('plugins dir created')
      return
    }

    const files = fs.readdirSync(this.pluginsDir).filter(f => f.endsWith('.js'))
    for (const file of files) await this._loadSinglePlugin(file)

    log(`${c.dim}${this.plugins.size} plugins loaded${c.reset}`)
  }

  async _loadSinglePlugin(file) {
    try {
      const filePath = path.join(this.pluginsDir, file)
      const imported = await import(`file://${filePath}?update=${Date.now()}`)
      const plugin   = imported.default

      if (!this.validatePlugin(plugin)) {
        warn(`skip ${file} · invalid structure`)
        return
      }

      if (file.startsWith('_')) plugin.hidden = true
      plugin.__file = file

      this.plugins.set(file, plugin)
      for (const cmd of plugin.command) this.commandMap.set(cmd, file)
    } catch (e) {
      err(`load error ${file} · ${formatError(e)}`)
    }
  }

  watchPlugins() {
    if (!fs.existsSync(this.pluginsDir)) return

    fs.watch(this.pluginsDir, (_, filename) => {
      if (!filename?.endsWith('.js')) return
      clearTimeout(this._reloadTimers.get(filename))
      this._reloadTimers.set(filename, setTimeout(() => {
        this._reloadTimers.delete(filename)
        this.reloadPlugin(filename)
      }, 300))
    })
  }

  async reloadPlugin(filename) {
    const filePath = path.join(this.pluginsDir, filename)

    if (!fs.existsSync(filePath)) {
      this._unregisterPlugin(filename)
      log(`${c.dim}removed · ${filename}${c.reset}`)
      return
    }

    try {
      const imported = await import(`file://${filePath}?update=${Date.now()}`)
      const plugin   = imported.default

      if (!this.validatePlugin(plugin)) {
        warn(`reload skip · ${filename} · invalid structure`)
        return
      }

      this._unregisterPlugin(filename)

      if (filename.startsWith('_')) plugin.hidden = true
      plugin.__file = filename

      this.plugins.set(filename, plugin)
      for (const cmd of plugin.command) this.commandMap.set(cmd, filename)

      ok(`reloaded · ${plugin.name} · ${filename}`)
    } catch (e) {
      err(`reload error · ${filename} · ${formatError(e)}`)
    }
  }

  _unregisterPlugin(filename) {
    this.plugins.delete(filename)
    for (const [cmd, file] of this.commandMap.entries()) {
      if (file === filename) {
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

  disable(cmd)     { this.disabled.add(cmd) }
  enable(cmd)      { this.disabled.delete(cmd) }
  isDisabled(cmd)  { return this.disabled.has(cmd) }

  getPlugin(command) {
    const file = this.commandMap.get(command)
    return file ? this.plugins.get(file) : null
  }

  getAllPlugins()    { return Array.from(this.plugins.values()) }
  getPublicPlugins() { return Array.from(this.plugins.values()).filter(p => !p.hidden) }
  getPluginCount()  { return this.plugins.size }

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
      if (ctx?.react) await ctx.react('✅').catch(() => {})
      return true
    } catch (e) {
      const msg = formatError(e)
      if (ctx?.react) await ctx.react('❌').catch(() => {})
      if (ctx?.reply) {
        await ctx.reply(
          `lahh error..\n\n` +
          `⟡ dari plugin : ${plugin.name}\n` +
          `⟡ error  : ${msg}`
        ).catch(() => {})
      }
      err(`plugin error · ${plugin.name} · ${msg}`)
      return false
    }
  }
}
