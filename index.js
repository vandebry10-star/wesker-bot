/* ════════════════════════════════════════════
 * Wesker-MD  ╌  febry wesker
 * ════════════════════════════════════════════
 * file    : index.js
 * desc    : entry point
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

import {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
  makeCacheableSignalKeyStore,
  Browsers,
  generateWAMessageFromContent,
  generateWAMessageContent
} from 'baileys'

import { Boom }      from '@hapi/boom'
import pino          from 'pino'
import qrcode        from 'qrcode-terminal'
import readline      from 'readline'
import fs            from 'fs'
import path          from 'path'
import crypto        from 'crypto'
import { fileURLToPath } from 'url'

import dotenv from 'dotenv'
dotenv.config({ path: './.env' })

import { setDebug }              from './system/helper/debug.js'
import PluginManager             from './system/manager/plugin.js'
import PrefixManager             from './system/manager/prefix.js'
import { handleMessageUpsert }   from './system/handler/message-upsert.js'
import { createPresenceHandler } from './system/handler/presence-update.js'
import { CoreListener }          from './system/listener/core-listener.js'
import { BOT_INFO }              from './system/helper/index.js'
import { loadFlows }             from './system/flow/flow-loader.js'
import { addUser, getRole }      from './system/helper/access.js'

setDebug(process.env.DEBUG === '1')

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const logger    = pino({ level: 'silent' })

const pluginManager = new PluginManager()
const prefixManager = new PrefixManager()

const PAIRING_CODE = 'WESKERMD'

const c = {
  reset: '\x1b[0m',
  dim  : '\x1b[90m',
  white: '\x1b[97m',
  bold : '\x1b[1m',
  green: '\x1b[32m',
  red  : '\x1b[31m',
}

const sep = () => process.stdout.write(`${c.dim}┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄${c.reset}\n`)
const log = (msg) => process.stdout.write(`  ${c.dim}⟡${c.reset} ${msg}\n`)

const rl       = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = q => new Promise(res => rl.question(q, res))

/* ════════════════════════════════════════
 * setup access — panggil sekali saat connected
 * ════════════════════════════════════════ */
let _accessSetup = false

async function setupAccess(feb) {
  if (_accessSetup) return
  _accessSetup = true

  const botJid = feb.user?.id
  if (!botJid) return

  // bot sendiri selalu owner
  if (!getRole(botJid)) {
    addUser(botJid, 'owner')
    log(`${c.dim}bot registered as owner · ${botJid}${c.reset}`)
  }

  // cek apakah sudah ada owner lain
  const { listAccess } = await import('./system/helper/access.js')
  const db  = listAccess()
  const devs = Object.entries(db).filter(([, v]) => v === 'owner' && !db[botJid])

  if (devs.length > 0) return // sudah ada owner, skip prompt

  // belum ada owner — minta input
  console.clear()
  sep()
  process.stdout.write(`  ${c.bold}${c.white}wesker-md${c.reset}  ${c.dim}access setup${c.reset}\n`)
  sep()
  log(`${c.dim}belum ada owner terdaftar${c.reset}`)
  log(`${c.dim}masukkan JID / LID kamu agar bisa pakai command${c.reset}`)
  log(`${c.dim}contoh: 6281234567890@s.whatsapp.net${c.reset}`)
  log(`${c.dim}atau kosongkan jika ingin skip${c.reset}`)
  sep()
  process.stdout.write('\n')

  const input = await question(`  ${c.dim}jid/lid > ${c.reset}`)
  const jid   = input.trim()

  if (jid) {
    addUser(jid, 'owner')
    log(`${c.green}${jid} registered as owner${c.reset}`)
  } else {
    log(`${c.dim}skip — gunakan command 'access' untuk tambah user nanti${c.reset}`)
  }

  sep()
  process.stdout.write('\n')
}

async function handleAuth() {
  const authPath = path.join(__dirname, 'auth', 'creds.json')
  if (!fs.existsSync(authPath)) {
    console.clear()
    sep()
    process.stdout.write(`  ${c.bold}${c.white}wesker-md${c.reset}  ${c.dim}auth setup${c.reset}\n`)
    sep()
    log(`${c.white}1${c.reset}${c.dim} · pairing code${c.reset}`)
    log(`${c.white}2${c.reset}${c.dim} · qr scan${c.reset}`)
    log(`${c.white}3${c.reset}${c.dim} · exit${c.reset}`)
    sep()
    process.stdout.write('\n')

    const choice = await question(`  ${c.dim}choice > ${c.reset}`)

    if (choice === '1') {
      const number = await question(`  ${c.dim}number  > ${c.reset}`)
      return { method: 'pairing', number: number.replace(/\D/g, '') }
    }
    if (choice === '2') return { method: 'qr' }
    process.exit(0)
  }
  return { method: 'existing' }
}

async function startWesker() {
  const authMethod           = await handleAuth()
  const { state, saveCreds } = await useMultiFileAuthState('./auth')
  const { version }          = await fetchLatestBaileysVersion()

  const feb = makeWASocket({
    version,
    logger,
    printQRInTerminal: authMethod.method === 'qr',
    auth: {
      creds: state.creds,
      keys : makeCacheableSignalKeyStore(state.keys, logger)
    },
    browser            : Browsers.ubuntu('Chrome'),
    markOnlineOnConnect: true,
    emitOwnEvents      : true,
    getMessage         : async () => undefined
  })

  if (authMethod.method === 'pairing' && !state.creds.registered) {
    try {
      await new Promise(r => setTimeout(r, 1000))
      const code    = await feb.requestPairingCode(authMethod.number, PAIRING_CODE)
      const display = code.match(/.{1,4}/g)?.join('-') ?? code

      console.clear()
      sep()
      process.stdout.write(`  ${c.bold}${c.white}wesker-md${c.reset}  ${c.dim}pairing code${c.reset}\n`)
      sep()
      process.stdout.write('\n')
      process.stdout.write(`  ${c.bold}${c.white}${display}${c.reset}\n`)
      process.stdout.write('\n')
      log(`${c.dim}whatsapp → linked devices → link with phone number${c.reset}`)
      sep()
      process.stdout.write('\n')
    } catch (e) {
      log(`${c.red}gagal minta pairing code: ${e.message}${c.reset}`)
    }
  }

  feb.pluginManager = pluginManager
  feb.prefixManager = prefixManager
  feb.botInfo       = BOT_INFO

  const coreListener = new CoreListener(feb)
  feb.coreListener   = coreListener
  coreListener.activate()

  feb.sendGroupStatus = async (jid, content = {}) => {
    const inside        = await generateWAMessageContent(content, { upload: feb.waUploadToServer })
    const messageSecret = crypto.randomBytes(32)
    const msg = generateWAMessageFromContent(
      'status@broadcast',
      {
        messageContextInfo: { messageSecret },
        groupStatusMessageV2: {
          message: { ...inside, messageContextInfo: { messageSecret } }
        }
      },
      { userJid: feb.user.id }
    )
    await feb.relayMessage('status@broadcast', msg.message, {
      messageId    : msg.key.id,
      statusJidList: [jid]
    })
  }

  feb.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
    if (qr && authMethod.method === 'qr') qrcode.generate(qr, { small: true })

    if (connection === 'open') {
      console.clear()
      sep()
      process.stdout.write(`  ${c.bold}${c.white}wesker-md${c.reset}\n`)
      sep()
      log(`${c.green}connected${c.reset}`)
      log(`${c.dim}${feb.user?.id || '-'}${c.reset}`)
      sep()
      process.stdout.write('\n')

      // setup access setelah connected
      await setupAccess(feb)
    }

    if (connection === 'close') {
      const status = lastDisconnect?.error instanceof Boom
        ? lastDisconnect.error.output.statusCode
        : null

      if (status === DisconnectReason.loggedOut) {
        fs.rmSync('./auth', { recursive: true, force: true })
        log(`${c.red}logged out · auth cleared${c.reset}`)
        process.exit(0)
      }

      log(`${c.dim}disconnected · reconnecting...${c.reset}`)
      setTimeout(startWesker, 3000)
    }
  })

  feb.ev.on('creds.update', saveCreds)

  feb.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return
    await handleMessageUpsert(feb, messages)
  })

  feb.ev.on('presence.update', createPresenceHandler(feb))
}

;(async () => {
  await pluginManager.loadPlugins()
  pluginManager.watchPlugins()
  await loadFlows()
  await startWesker()
})()
