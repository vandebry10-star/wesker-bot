/* ════════════════════════════════════════════
 * Wesker-MD  ╌  febry wesker
 * ════════════════════════════════════════════
 * file    : system/manager/reaction.js
 * desc    : system › manager › reaction
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
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default class PluginManager {
  constructor() {
    this.plugins = new Map()      
    this.commandMap = new Map()   
    this.reactionMap = new Map()  
  }

  async loadPlugins() {
    const dir = path.join(__dirname, '../../plugins')
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

    const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'))

    for (const file of files) {
      await this.loadPluginFile(file)
    }

    console.log(`[PLUGIN] Loaded ${this.plugins.size} plugins`)
  }

  async loadPluginFile(file) {
    try {
      const filePath = path.join(__dirname, '../../plugins', file)
      const mod = await import(`file://${filePath}?update=${Date.now()}`)
      const plugin = mod.default

      if (!this.validate(plugin)) {
        console.log(`[PLUGIN] Invalid: ${file}`)
        return
      }

      this.plugins.set(file, plugin)

      for (const cmd of plugin.command || []) {
        this.commandMap.set(cmd, plugin)
      }

      if (plugin.reaction) {
        this.reactionMap.set(plugin.reaction, plugin)
      }

      console.log(`[PLUGIN] ✓ ${plugin.name} (${file})`)
    } catch (e) {
      console.error(`[PLUGIN] Load error (${file}):`, e.message)
    }
  }

  validate(p) {
    return (
      p &&
      typeof p.name === 'string' &&
      typeof p.run === 'function' &&
      (Array.isArray(p.command) || typeof p.reaction === 'string')
    )
  }

  async executePlugin(command, ctx) {
  const plugin = this.commandMap.get(command)
  if (!plugin) return false

  try {
    await plugin.run(ctx)
    return true
  } catch (e) {
    console.error(`[PLUGIN ERROR] ${plugin.name}:`, e)
    await ctx.react?.('❌')
    await ctx.reply?.(`❌ ${e.message}`)
    return false
  }
  }

  async dispatchReaction(reaction, baseCtx) {
    const plugin = this.reactionMap.get(reaction.emoji)
    if (!plugin) return false

    try {
      await plugin.run({
        ...baseCtx,
        reaction
      })
      return true
    } catch (e) {
      console.error(`[REACTION ERROR] ${plugin.name}:`, e)
      return false
    }
  }

  async dispatchButton(buttonId, ctx) {
    const plugin = this.commandMap.get(buttonId)
    if (!plugin) return false

    try {
      await plugin.run(ctx)
      return true
    } catch (e) {
      console.error(`[BUTTON ERROR] ${plugin.name}:`, e)
      return false
    }
  }

  watchPlugins() {
    const dir = path.join(__dirname, '../../plugins')

    fs.watch(dir, (evt, file) => {
      if (!file || !file.endsWith('.js')) return

      console.log(`[PLUGIN] Reloading ${file}...`)
      this.plugins.delete(file)

      for (const [k, v] of this.commandMap.entries()) {
        if (v === this.plugins.get(file)) this.commandMap.delete(k)
      }

      for (const [k, v] of this.reactionMap.entries()) {
        if (v === this.plugins.get(file)) this.reactionMap.delete(k)
      }

      this.loadPluginFile(file)
    })
  }

  getPlugin(cmd) {
    return this.commandMap.get(cmd)
  }

  getPluginCount() {
    return this.plugins.size
  }
}
