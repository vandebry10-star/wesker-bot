// wesker-bot · febry.is-a.dev · github.com/vandebry10-star/wesker-bot


import path from 'node:path'
import { fileURLToPath } from 'url'
import { ConfigCache } from './config-cache.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const RCMD_FILE = path.join(__dirname, '../cache/reaction-cmd.json')

const cache = new ConfigCache(RCMD_FILE, {})

const stripPrefix = s => String(s).trim().replace(/^[.\/!#$%^&*?,;:~`+=-]+/, '')

export function getReactionCmdDB() {
  return cache.get()
}

export function addReactionCmd(emoji, cmd) {
  if (!emoji || !cmd) return
  const db = cache.get()
  db[emoji] = stripPrefix(cmd)
  cache.set(db)
}

export function removeReactionCmd(emoji) {
  if (!emoji) return
  const db = cache.get()
  delete db[emoji]
  cache.set(db)
}

export function setReactionCmdDB(data) {
  cache.set(data)
}

export function getReactionCmd(emoji) {
  if (!emoji) return null
  return cache.get()[emoji] || null
}

