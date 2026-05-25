// wesker-bot · febry.is-a.dev · github.com/vandebry10-star/wesker-bot

// WARNING: fitur ini bisa disalahgunakan untuk impersonate akun resmi
// (WA Business verified, bank, lembaga). pakai untuk testing / iseng pribadi.
// dilarang dipakai untuk phishing / scam. tanggung jawab user sepenuhnya.

import path from 'node:path'
import { fileURLToPath } from 'url'
import { ConfigCache } from './config-cache.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FAKEQ_FILE = path.join(__dirname, '../cache/fakeq.json')

const cache = new ConfigCache(FAKEQ_FILE, { enabled: true })

export function isFakeQEnabled() {
  return cache.get().enabled !== false
}

export function setFakeQ(state) {
  cache.set({ enabled: Boolean(state) })
}

