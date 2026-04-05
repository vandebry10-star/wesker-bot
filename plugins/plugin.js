/* ════════════════════════════════════════════
 * Wesker-MD  ╌  febry wesker
 * file    : plugins/plugin.js
 * desc    : plugins › plugin
 * author  : febry  ⪩  2026
 * ════════════════════════════════════════════ */

import fs   from 'node:fs'
import path from 'node:path'
import { randomUUID }                from 'node:crypto'
import { writeFile, unlink }         from 'node:fs/promises'
import { pathToFileURL }             from 'node:url'
import { downloadContentFromMessage } from 'baileys'
import { weskerSend }                from '../system/helper/wesker-message.js'

const PLUGIN_DIR = path.resolve('./plugins')

function normalizeName(name) {
  if (!name) return null
  return name.endsWith('.js') ? name : name + '.js'
}

async function downloadDoc(docMsg) {
  const stream = await downloadContentFromMessage(docMsg, 'document')
  let buf = Buffer.alloc(0)
  for await (const chunk of stream) buf = Buffer.concat([buf, chunk])
  return buf
}

async function validatePlugin(code, filename, pm) {
  const errors   = []
  const warnings = []

  // strip hanya import external (bukan node: builtins dan bukan relative)
  // supaya path, fs, dll dari node: tetap tersedia saat dynamic import
  const sanitized = code.replace(
    /^\s*import\s[\s\S]+?from\s+['"](?!node:)(?![./])[^'"]+['"];?\s*$/gm,
    ''
  )

  // taruh di PLUGIN_DIR biar node_modules resolve dari sana
  const tmpFile = path.join(PLUGIN_DIR, `_validate_${randomUUID()}.mjs`)
  let mod = null

  try {
    await writeFile(tmpFile, sanitized, 'utf8')
    mod = await import(pathToFileURL(tmpFile).href + '?t=' + Date.now())
  } catch (e) {
    errors.push(`syntax error: ${e.message}`)
    return { ok: false, errors, warnings }
  } finally {
    await unlink(tmpFile).catch(() => {})
  }

  const plugin = mod?.default
  if (!plugin || typeof plugin !== 'object') {
    errors.push('export default harus berupa object')
    return { ok: false, errors, warnings }
  }

  if (!plugin.name || typeof plugin.name !== 'string')
    errors.push('field "name" wajib ada dan bertipe string')

  if (!Array.isArray(plugin.command) || !plugin.command.length) {
    errors.push('field "command" wajib ada dan bertipe array non-kosong')
  } else {
    for (const c of plugin.command)
      if (typeof c !== 'string' || !c.trim())
        errors.push(`command "${c}" tidak valid`)
  }

  if (typeof plugin.run !== 'function')
    errors.push('field "run" wajib ada dan bertipe function')

  if (plugin.category  !== undefined && !Array.isArray(plugin.category))
    warnings.push('field "category" sebaiknya array')

  if (plugin.description !== undefined && typeof plugin.description !== 'string')
    warnings.push('field "description" sebaiknya string')

  if (plugin.hidden !== undefined && typeof plugin.hidden !== 'boolean')
    warnings.push('field "hidden" sebaiknya boolean')

  if (pm && Array.isArray(plugin.command)) {
    for (const cmd of plugin.command) {
      const existing = pm.getPlugin(cmd)
      if (existing && existing.name !== plugin.name) {
        const existingFile = [...(pm.plugins?.entries() || [])]
          .find(([, p]) => p === existing)?.[0]
        if (existingFile !== filename)
          warnings.push(`command "${cmd}" sudah dipakai oleh plugin "${existing.name}"`)
      }
    }
  }

  if (errors.length) return { ok: false, errors, warnings }
  return { ok: true, errors, warnings, plugin }
}

function formatValidation(result, filename) {
  const lines = []
  if (!result.ok) {
    lines.push(`❌ validasi gagal: ${filename}`)
    for (const e of result.errors) lines.push(`  ✗ ${e}`)
  } else {
    lines.push(`✅ validasi ok: ${filename}`)
  }
  if (result.warnings.length) {
    lines.push(`⚠️ warning:`)
    for (const w of result.warnings) lines.push(`  ⚠ ${w}`)
  }
  return lines.join('\n')
}

export default {
  name   : 'plugin',
  command: ['plugin'],
  category: ['owner'],
  hidden : true,

  async run(ctx) {
    const { m, args, feb, other, wesker } = ctx
    const pm    = wesker
    const store = other?.storeMessage

    if (!args[0]) {
      return weskerSend(feb, m.chat,
`plugin manager

plugin list
plugin get <file> [-t]
plugin check <file>

plugin -i  <name?>   install
plugin -ir <name?>   replace
plugin -iv <name?>   install + strict validation

plugin on  <command>
plugin off <command>
plugin -d  <file>`,
        { quoted: m.raw })
    }

    const action = args[0]

    /* LIST */
    if (action === 'list') {
      const files = fs.readdirSync(PLUGIN_DIR).filter(f => f.endsWith('.js'))
      if (!files.length) return weskerSend(feb, m.chat, 'belum ada plugin', { quoted: m.raw })
      const lines = files.map(f => {
        const loaded = pm?.plugins?.get(f)
        const cmds   = loaded?.command?.join(', ') || '?'
        const off    = loaded?.command?.some(c => pm?.isDisabled(c)) ? ' [OFF]' : ''
        return `⟡ ${f}  →  ${cmds}${off}`
      })
      return weskerSend(feb, m.chat, `plugin list (${files.length})\n\n${lines.join('\n')}`, { quoted: m.raw })
    }

    /* GET */
    if (action === 'get') {
      const name = normalizeName(args[1])
      if (!name) return weskerSend(feb, m.chat, 'nama file diperlukan', { quoted: m.raw })
      const target = path.join(PLUGIN_DIR, name)
      if (!fs.existsSync(target)) return weskerSend(feb, m.chat, 'plugin tidak ditemukan', { quoted: m.raw })
      const data = fs.readFileSync(target)
      if (args.includes('-t')) return weskerSend(feb, m.chat, data.toString(), { quoted: m.raw })
      return weskerSend(feb, m.chat, { document: data }, { mimetype: 'application/javascript', fileName: name, quoted: m.raw })
    }

    /* CHECK */
    if (action === 'check') {
      const name = normalizeName(args[1])
      if (!name) return weskerSend(feb, m.chat, 'nama file diperlukan', { quoted: m.raw })
      const target = path.join(PLUGIN_DIR, name)
      if (!fs.existsSync(target)) return weskerSend(feb, m.chat, 'plugin tidak ditemukan', { quoted: m.raw })
      const code   = fs.readFileSync(target, 'utf8')
      const result = await validatePlugin(code, name, pm)
      return weskerSend(feb, m.chat, formatValidation(result, name), { quoted: m.raw })
    }

    /* INSTALL / REPLACE */
    if (action === '-i' || action === '-ir' || action === '-iv') {
      if (!store) return weskerSend(feb, m.chat, 'storeMessage tidak tersedia', { quoted: m.raw })

      const sourceId = m.quoted?.id || m.id
      const stored   = await store.get(sourceId)
      if (!stored?.raw) return weskerSend(feb, m.chat, 'pesan sumber tidak ditemukan', { quoted: m.raw })

      const raw  = stored.raw.message
      let   code = null

      if (raw?.conversation || raw?.extendedTextMessage?.text) {
        code = raw.conversation || raw.extendedTextMessage.text
      } else if (raw?.documentMessage) {
        const buf = await downloadDoc(raw.documentMessage)
        code = buf.toString()
      }

      if (!code?.trim()) return weskerSend(feb, m.chat, 'pesan bukan kode plugin', { quoted: m.raw })

      let name = args[1]
      if (!name) {
        const match = code.match(/command\s*:\s*\[\s*['"`](\w+)/)
        if (!match) return weskerSend(feb, m.chat, 'gagal deteksi nama plugin', { quoted: m.raw })
        name = match[1]
      }

      const file   = normalizeName(name)
      const target = path.join(PLUGIN_DIR, file)

      if (fs.existsSync(target) && action === '-i')
        return weskerSend(feb, m.chat, `plugin "${file}" sudah ada — pakai -ir untuk replace`, { quoted: m.raw })

      const strict = action === '-iv'
      const result = await validatePlugin(code, file, pm)

      if (!result.ok)
        return weskerSend(feb, m.chat, formatValidation(result, file) + '\n\nplugin tidak diinstall', { quoted: m.raw })

      if (strict && result.warnings.length)
        return weskerSend(feb, m.chat, formatValidation(result, file) + '\n\npakai -i atau -ir untuk install dengan warning', { quoted: m.raw })

      fs.writeFileSync(target, code)
      if (pm) await pm.reloadPlugin(file)

      let msg = (action === '-ir' ? '♻️ plugin replaced' : '✅ plugin installed') + `\n⟡ file: ${file}`
      if (result.warnings.length) msg += '\n\n' + formatValidation(result, file)
      return weskerSend(feb, m.chat, msg, { quoted: m.raw })
    }

    /* ON / OFF */
    if (action === 'on' || action === 'off') {
      const cmd = args[1]
      if (!cmd) return weskerSend(feb, m.chat, 'command diperlukan', { quoted: m.raw })
      if (action === 'on') pm.enable(cmd)
      else pm.disable(cmd)
      return weskerSend(feb, m.chat, `plugin ${action === 'on' ? '🟢 enabled' : '🔴 disabled'}: ${cmd}`, { quoted: m.raw })
    }

    /* DELETE */
    if (action === '-d') {
      const name = normalizeName(args[1])
      if (!name) return weskerSend(feb, m.chat, 'nama file diperlukan', { quoted: m.raw })
      const target = path.join(PLUGIN_DIR, name)
      if (!fs.existsSync(target)) return weskerSend(feb, m.chat, 'plugin tidak ditemukan', { quoted: m.raw })
      pm?._unregisterPlugin(name)
      fs.unlinkSync(target)
      return weskerSend(feb, m.chat, `🗑️ plugin dihapus: ${name}`, { quoted: m.raw })
    }

    return weskerSend(feb, m.chat, 'aksi tidak dikenal', { quoted: m.raw })
  }
}
