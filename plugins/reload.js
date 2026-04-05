/* ════════════════════════════════════════════
 * Wesker-MD  ╌  febry wesker
 * ════════════════════════════════════════════
 * file    : plugins/reload.js
 * desc    : plugins › reload
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

import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const ROOT = process.cwd()
const SNAPSHOT_FILE = path.resolve('system/cache/.reload-snapshot.json')

const IGNORE = [
  'node_modules',
  '.git',
  'system/cache',
  'auth',
  'package-lock.json'
]

function shouldIgnore(p) {
  return IGNORE.some(x => p.includes(path.sep + x))
}

function hash(file) {
  return crypto.createHash('sha1')
    .update(fs.readFileSync(file))
    .digest('hex')
}

function scan(dir, out = {}) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name)
    if (shouldIgnore(full)) continue

    if (e.isDirectory()) scan(full, out)
    else if (e.isFile()) {
      out[path.relative(ROOT, full)] = hash(full)
    }
  }
  return out
}

function loadSnapshot() {
  if (!fs.existsSync(SNAPSHOT_FILE)) return null
  return JSON.parse(fs.readFileSync(SNAPSHOT_FILE))
}

function saveSnapshot(data) {
  fs.mkdirSync(path.dirname(SNAPSHOT_FILE), { recursive: true })
  fs.writeFileSync(SNAPSHOT_FILE, JSON.stringify(data, null, 2))
}

export default {
  name: 'reload',
  command: ['reload', 'rd'],
  category: ['owner'],
  description: 'reload manual folder plugins'

  async run({ m, other, wesker }) {
    const pm = wesker
    if (!pm) return

    await m.react('🔄')

    const prev = loadSnapshot()
    const curr = scan(ROOT)

    if (pm.loadPlugins) await pm.loadPlugins()
    else if (pm.reload) await pm.reload()

    const added = []
    const updated = []
    const removed = []

    if (prev) {
      for (const f in curr) {
        if (!prev[f]) added.push(f)
        else if (prev[f] !== curr[f]) updated.push(f)
      }

      for (const f in prev) {
        if (!curr[f]) removed.push(f)
      }
    }

    saveSnapshot(curr)

    let text = `*reload success*\n`
    text += `tracked: ${Object.keys(curr).length}\n\n`

    if (!prev) {
      text += `snapshot dibuat (first run)\n`
    } else {
      if (added.length) text += `added (${added.length})\n${added.map(x=>`• ${x}`).join('\n')}\n\n`
      if (updated.length) text += `updated (${updated.length})\n${updated.map(x=>`• ${x}`).join('\n')}\n\n`
      if (removed.length) text += `removed (${removed.length})\n${removed.map(x=>`• ${x}`).join('\n')}\n\n`
      if (!added.length && !updated.length && !removed.length)
        text += `tidak ada perubahan\n`
    }

    await m.reply(text.trim())
    await m.react('✅')
  }
}
