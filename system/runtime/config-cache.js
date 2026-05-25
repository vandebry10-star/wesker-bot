// wesker-bot · febry.is-a.dev · github.com/vandebry10-star/wesker-bot


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