/* ════════════════════════════════════════════
 * Wesker-MD  ╌  febry wesker
 * file    : plugins/dev/plugin.js
 * desc    : plugins › plugin manager
 * author  : febry  ⪩  2026
 * ════════════════════════════════════════════ */

import fs from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { writeFile, unlink } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import { downloadContentFromMessage } from 'baileys'

const PLUGIN_DIR = path.resolve('./plugins')

function normalizeName(name) {
  if (!name) return null
  return name.endsWith('.js')
    ? name
    : name + '.js'
}

function getPluginFiles(dir, base = '') {

  const entries = fs.readdirSync(dir, {
    withFileTypes: true
  })

  let files = []

  for (const entry of entries) {

    const full = path.join(dir, entry.name)
    const rel = path.join(base, entry.name)

    if (entry.isDirectory()) {
      files.push(
        ...getPluginFiles(full, rel)
      )
    }

    else if (entry.name.endsWith('.js')) {
      files.push(rel)
    }

  }

  return files
}

function findPluginByName(name) {

  if (!name) return []

  const files =
    getPluginFiles(PLUGIN_DIR)

  const normalized =
    normalizeName(name)
      .replace(/\\/g, '/')

  // kalau ada slash = anggap path
  if (normalized.includes('/')) {

    return files.filter(f =>
      f.replace(/\\/g, '/')
        === normalized
    )

  }

  // fallback basename
  return files.filter(f =>
    path.basename(f)
      === normalized
  )
}

async function downloadDoc(docMsg) {

  const stream =
    await downloadContentFromMessage(
      docMsg,
      'document'
    )

  let buf = Buffer.alloc(0)

  for await (const chunk of stream) {
    buf = Buffer.concat([buf, chunk])
  }

  return buf
}

async function validatePlugin(
  code,
  filename,
  pm
) {

  const errors = []
  const warnings = []

  const sanitized = code.replace(
    /^\s*import\s[\s\S]+?from\s+['"](?!node:)(?![./])[^'"]+['"];?\s*$/gm,
    ''
  )

  const relativeDir =
    path.dirname(filename)

  const validateDir =
    path.join(
      PLUGIN_DIR,
      relativeDir
    )

  fs.mkdirSync(validateDir, {
    recursive: true
  })

  const tmpFile = path.join(
    validateDir,
    `_validate_${randomUUID()}.mjs`
  )

  let mod = null

  try {

    await writeFile(
      tmpFile,
      sanitized,
      'utf8'
    )

    mod = await import(
      pathToFileURL(tmpFile).href +
      '?t=' + Date.now()
    )

  } catch (e) {

    errors.push(
      `syntax error: ${e.message}`
    )

    return {
      ok: false,
      errors,
      warnings
    }

  } finally {

    await unlink(tmpFile)
      .catch(() => {})

  }

  const plugin = mod?.default

  if (
    !plugin ||
    typeof plugin !== 'object'
  ) {

    errors.push(
      'export default harus berupa object'
    )

    return {
      ok: false,
      errors,
      warnings
    }

  }

  if (
    !plugin.name ||
    typeof plugin.name !== 'string'
  ) {

    errors.push(
      'field "name" wajib ada dan bertipe string'
    )

  }

  if (
    !Array.isArray(plugin.command) ||
    !plugin.command.length
  ) {

    errors.push(
      'field "command" wajib ada dan bertipe array non-kosong'
    )

  } else {

    for (const c of plugin.command) {

      if (
        typeof c !== 'string' ||
        !c.trim()
      ) {

        errors.push(
          `command "${c}" tidak valid`
        )

      }
    }
  }

  if (
    typeof plugin.run !== 'function'
  ) {

    errors.push(
      'field "run" wajib ada dan bertipe function'
    )

  }

  if (
    plugin.category !== undefined &&
    !Array.isArray(plugin.category)
  ) {

    warnings.push(
      'field "category" sebaiknya array'
    )

  }

  if (
    plugin.description !== undefined &&
    typeof plugin.description !== 'string'
  ) {

    warnings.push(
      'field "description" sebaiknya string'
    )

  }

  if (
    plugin.hidden !== undefined &&
    typeof plugin.hidden !== 'boolean'
  ) {

    warnings.push(
      'field "hidden" sebaiknya boolean'
    )

  }

  if (
    pm &&
    Array.isArray(plugin.command)
  ) {

    for (const cmd of plugin.command) {

      const existing =
        pm.getPlugin(cmd)

      if (
        existing &&
        existing.name !== plugin.name
      ) {

        const existingFile = [
          ...(pm.plugins?.entries() || [])
        ].find(([, p]) => p === existing)?.[0]

        if (existingFile !== filename) {

          warnings.push(
            `command "${cmd}" sudah dipakai oleh plugin "${existing.name}"`
          )

        }
      }
    }
  }

  if (errors.length) {

    return {
      ok: false,
      errors,
      warnings
    }

  }

  return {
    ok: true,
    errors,
    warnings,
    plugin
  }
}

function formatValidation(
  result,
  filename
) {

  const lines = []

  if (!result.ok) {

    lines.push(
      `❌ validasi gagal: ${filename}`
    )

    for (const e of result.errors) {
      lines.push(`  ✗ ${e}`)
    }

  } else {

    lines.push(
      `✅ validasi ok: ${filename}`
    )

  }

  if (result.warnings.length) {

    lines.push('⚠️ warning:')

    for (const w of result.warnings) {
      lines.push(`  ⚠ ${w}`)
    }

  }

  return lines.join('\n')
}

export default {

  name: 'plugin',
  command: ['plugin'],
  category: ['dev'],
  hidden: true,
  description:
`plugin manager

plugin list          // melihat list plugin
plugin get <file>    // send file plugin
plugin get <file> -t // send teks plugin
plugin check <file>  // check/validasi plugin

plugin -i   // install plugin
plugin -ir  // install & replace plugin
plugin -iv  // install & validasi plugin (lebih ketat dari -ir)

plugin on <command>
plugin off <command>

plugin -d <file>     // delete plugin`,

  async run(ctx) {

    const {
      m,
      args,
      other,
      wesker
    } = ctx

    const pm = wesker
    const store = other?.storeMessage

    if (!args[0]) {

      return m.sendText(`plugin manager

plugin list          // melihat list plugin
plugin get <file>    // send file plugin
plugin get <file> -t // send teks plugin
plugin check <file>  // check/validasi plugin

plugin -i   // install plugin
plugin -ir  // install & replace plugin
plugin -iv  // install & validasi plugin (lebih ketat dari -ir)

plugin on <command>
plugin off <command>

plugin -d <file>     // delete plugin`)

    }

    const action = args[0]

    /* LIST */
    if (action === 'list') {

      const files =
        getPluginFiles(PLUGIN_DIR)

      if (!files.length) {
        return m.sendText(
          'belum ada plugin'
        )
      }

      const lines = files.map(f => {

        const loaded =
          pm?.plugins?.get(f)

        const cmds =
          loaded?.command?.join(', ')
          || '?'

        const off =
          loaded?.command?.some(c =>
            pm?.isDisabled(c)
          )
            ? ' [OFF]'
            : ''

        return `⟡ ${f} → ${cmds}${off}`

      })

      return m.sendText(
        `plugin list (${files.length})\n\n${lines.join('\n')}`
      )
    }

    /* GET */
    if (action === 'get') {

      const input = args[1]

      if (!input) {
        return m.sendText(
          'nama file diperlukan'
        )
      }

      const matches =
        findPluginByName(input)

      if (!matches.length) {
        return m.sendText(
          'plugin tidak ditemukan'
        )
      }

      if (matches.length > 1) {

        return m.sendText(
          `⚠️ ditemukan ${matches.length} plugin dengan nama sama\n\n` +
          matches.map(v => `⟡ ${v}`).join('\n') +
          '\n\npakai path lengkap'
        )

      }

      const file = matches[0]

      const target = path.join(
        PLUGIN_DIR,
        file
      )

      const data =
        fs.readFileSync(target)

      const text =
        data.toString()

      const lines =
        text.split('\n').length

      const caption =
`📦 ${path.basename(file)}

📁 path:
${file}

📄 lines:
${lines}`

      if (args.includes('-t')) {
        return m.sendText(text)
      }

      return m.sendDocument(
        data,
        path.basename(file),
        {
          mimetype:
            'application/javascript',
          caption
        }
      )
    }

    /* CHECK */
    if (action === 'check') {

      const input = args[1]

      if (!input) {
        return m.sendText(
          'nama file diperlukan'
        )
      }

      const matches =
        findPluginByName(input)

      if (!matches.length) {
        return m.sendText(
          'plugin tidak ditemukan'
        )
      }

      if (matches.length > 1) {

        return m.sendText(
          `⚠️ ditemukan ${matches.length} plugin dengan nama sama\n\n` +
          matches.map(v => `⟡ ${v}`).join('\n') +
          '\n\npakai path lengkap'
        )

      }

      const file = matches[0]

      const target = path.join(
        PLUGIN_DIR,
        file
      )

      const code =
        fs.readFileSync(target, 'utf8')

      const result =
        await validatePlugin(
          code,
          file,
          pm
        )

      return m.sendText(
        formatValidation(result, file)
      )
    }

    /* INSTALL / REPLACE */
    if (
      action === '-i' ||
      action === '-ir' ||
      action === '-iv'
    ) {

      if (!store) {
        return m.sendText(
          'storeMessage tidak tersedia'
        )
      }

      const sourceId =
        m.quoted?.id || m.id

      const stored =
        await store.get(sourceId)

      if (!stored?.raw) {
        return m.sendText(
          'pesan sumber tidak ditemukan'
        )
      }

      const raw =
        stored.raw.message

      let code = null

      if (
        raw?.conversation ||
        raw?.extendedTextMessage?.text
      ) {

        code =
          raw.conversation ||
          raw.extendedTextMessage.text

      }

      else if (raw?.documentMessage) {

        const buf =
          await downloadDoc(
            raw.documentMessage
          )

        code = buf.toString()

      }

      if (!code?.trim()) {
        return m.sendText(
          'pesan bukan kode plugin'
        )
      }

      // regex parse
      const nameMatch = code.match(
        /name\s*:\s*['"`]([^'"`]+)['"`]/
      )

      if (!nameMatch) {

        return m.sendText(
          'gagal deteksi field name'
        )

      }

      const pluginName =
        nameMatch[1]

      const categoryMatch = code.match(
        /category\s*:\s*\[\s*['"`]([^'"`]+)['"`]/
      )

      const category =
        categoryMatch?.[1] || 'misc'

      const filename =
        pluginName.endsWith('.js')
          ? pluginName
          : pluginName + '.js'

      const relativePath =
        path.join(
          category,
          filename
        )

      const target =
        path.join(
          PLUGIN_DIR,
          relativePath
        )

      const result =
        await validatePlugin(
          code,
          relativePath,
          pm
        )

      if (!result.ok) {

        return m.sendText(
          formatValidation(
            result,
            relativePath
          ) +
          '\n\nplugin tidak diinstall'
        )

      }

      if (
        fs.existsSync(target) &&
        action === '-i'
      ) {

        return m.sendText(
          `plugin sudah ada\n\n📁 ${relativePath}\n\npakai -ir untuk replace`
        )

      }

      const strict =
        action === '-iv'

      if (
        strict &&
        result.warnings.length
      ) {

        return m.sendText(
          formatValidation(
            result,
            relativePath
          ) +
          '\n\npakai -i atau -ir untuk install dengan warning'
        )

      }

      fs.mkdirSync(
        path.dirname(target),
        { recursive: true }
      )

      fs.writeFileSync(
        target,
        code
      )

      if (pm) {
        await pm.reloadPlugin(
          relativePath
        )
      }

      let msg =
        (
          action === '-ir'
            ? '♻️ plugin replaced'
            : '✅ plugin installed'
        ) +
        `

📦 plugin:
${pluginName}

📁 path:
${relativePath}`

      if (
        result.warnings.length
      ) {

        msg +=
          '\n\n' +
          formatValidation(
            result,
            relativePath
          )

      }

      return m.sendText(msg)
    }

    /* ON / OFF */
    if (
      action === 'on' ||
      action === 'off'
    ) {

      const cmd = args[1]

      if (!cmd) {
        return m.sendText(
          'command diperlukan'
        )
      }

      if (action === 'on') {
        pm.enable(cmd)
      }

      else {
        pm.disable(cmd)
      }

      return m.sendText(
        `plugin ${action === 'on'
          ? '🟢 enabled'
          : '🔴 disabled'
        }: ${cmd}`
      )
    }

    /* DELETE */
    if (action === '-d') {

      const input = args[1]

      if (!input) {
        return m.sendText(
          'nama file diperlukan'
        )
      }

      const matches =
        findPluginByName(input)

      if (!matches.length) {
        return m.sendText(
          'plugin tidak ditemukan'
        )
      }

      if (matches.length > 1) {

        return m.sendText(
          `⚠️ ditemukan ${matches.length} plugin dengan nama sama\n\n` +
          matches.map(v => `⟡ ${v}`).join('\n') +
          '\n\npakai path lengkap'
        )

      }

      const file = matches[0]

      const target = path.join(
        PLUGIN_DIR,
        file
      )

      pm?._unregisterPlugin(file)

      fs.unlinkSync(target)

      return m.sendText(
        `🗑️ plugin dihapus\n\n📁 ${file}`
      )
    }

    return m.sendText(
      'aksi tidak dikenal'
    )
  }
          }
