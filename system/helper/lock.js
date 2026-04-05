import path from 'node:path'
import { fileURLToPath } from 'url'
import { ConfigCache } from './config-cache.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const LOCK_FILE = path.join(__dirname, '../cache/lock.json')

const cache = new ConfigCache(LOCK_FILE, { locked: false })

export function isLocked() {
  return cache.get().locked === true
}

export function lockBot() {
  cache.set({ locked: true })
}

export function unlockBot() {
  cache.set({ locked: false })
}
