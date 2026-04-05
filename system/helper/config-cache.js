/* ════════════════════════════════════════════
 * Wesker-MD  ╌  febry wesker
 * ════════════════════════════════════════════
 * file    : system/helper/config-cache.js
 * desc    : system › helper › config-cache
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

export class ConfigCache {
  
  constructor(filePath, defaultValue = {}) {
    this.filePath = filePath
    this.defaultValue = defaultValue
    this._data = null
    this._ensure()
    this._load()
  }

  _ensure() {
    const dir = path.dirname(this.filePath)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify(this.defaultValue, null, 2))
    }
  }

  _load() {
    try {
      const raw = fs.readFileSync(this.filePath, 'utf8')
      this._data = JSON.parse(raw)
    } catch {
      this._data = typeof this.defaultValue === 'object'
        ? { ...this.defaultValue }
        : this.defaultValue
    }
  }

  get() {
    return this._data
  }

  set(data) {
    this._data = data
    this._flush()
  }

  reload() {
    this._load()
  }

  _flush() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this._data, null, 2))
    } catch (err) {
      console.error('[CONFIG-CACHE] flush error:', this.filePath, err.message)
    }
  }
}