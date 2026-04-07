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

import { Boom }          from '@hapi/boom'
import pino              from 'pino'
import qrcode            from 'qrcode-terminal'
import fs                from 'fs'
import path              from 'path'
import crypto            from 'crypto'
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

setDebug(process.env.DEBUG === '1')

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const logger    = pino({ level: 'silent' })

const pluginManager = new PluginManager()
const prefixManager = new PrefixManager()

const PAIRING_CODE = 'WESKERMD'

// ── colors ────────────────────────────────────
const c = {
  reset : '\x1b[0m',
  dim   : '\x1b[90m',
  white : '\x1b[97m',
  bold  : '\x1b[1m',
  green : '\x1b[32m',
  cyan  : '\x1b[36m',
  yellow: '\x1b[33m',
  red   : '\x1b[31m',
  blue  : '\x1b[34m',
}

const W = (...args) => process.stdout.write(args.join(''))

const nl  = ()        => W('\n')
const sep = () =>
  W(`${c.dim}  ─────────────────────────────${c.reset}\n`)
const row = (k, v, col = c.white) =>
  W(`  ${c.bold}${k.padEnd(12)}${c.reset}${col}${v}${c.reset}\n`)
const hdr = (title, sub = '') => {
  nl()
  sep()
  W(`  ${c.bold}${c.white}${title}${c.reset}`)
  if (sub) W(`  ${c.dim}${sub}${c.reset}`)
  W('\n')
  sep()
  nl()
}

function ask(prompt) {
  return new Promise(resolve => {
    W(`  ${c.dim}${prompt}${c.reset}  `)
    process.stdin.resume()
    process.stdin.setEncoding('utf8')
    process.stdin.once('data', data => {
      process.stdin.pause()
      resolve(data.replace(/\r?\n$/, '').trim())
    })
  })
}

async function handleAuth() {
  const authPath = path.join(__dirname, 'auth', 'creds.json')

  if (!fs.existsSync(authPath)) {
    console.clear()
    hdr('wesker-md', 'auth setup')

    W(`  ${c.bold}metode login${c.reset}\n`)
    W(`  ${c.white}  1${c.reset}  pairing code  ${c.dim}(disarankan, tanpa scan)${c.reset}\n`)
    W(`  ${c.white}  2${c.reset}  qr scan       ${c.dim}(scan seperti biasa)${c.reset}\n`)
    W(`  ${c.white}  3${c.reset}  exit\n`)

    nl()

    const choice = await ask('pilih  >')
    nl()

    if (choice === '1') {
      W(`  ${c.bold}nomor whatsapp${c.reset}\n`)
      W(`  ${c.dim}  gunakan format 628xxx (tanpa + atau spasi)${c.reset}\n`)
      nl()

      const number = await ask('nomor  >')
      nl()

      return {
        method: 'pairing',
        number: number.replace(/\D/g, '')
      }
    }

    if (choice === '2') {
      nl()
      W(`  ${c.dim}menunggu qr code...\n${c.reset}`)
      nl()
      return { method: 'qr' }
    }

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

  /* ─ pairing ─ */
  if (authMethod.method === 'pairing' && !state.creds.registered) {
  try {
    await new Promise(r => setTimeout(r, 1200))

    const code    = await feb.requestPairingCode(authMethod.number, PAIRING_CODE)
    const display = code.match(/.{1,4}/g)?.join('-') ?? code

    console.clear()
    hdr('wesker-md', 'pairing code')

    nl()

    // pairing code block (fix visibility)
    W(`  ${c.bold}${c.white}code${c.reset}\n`)
    W(`  ${c.bold}${c.cyan}  ${display}${c.reset}\n`)

    nl()

    W(`  ${c.bold}instruksi${c.reset}\n`)
    W(`  ${c.dim}  1. buka whatsapp di hp kamu${c.reset}\n`)
    W(`  ${c.dim}  2. masuk ke linked devices${c.reset}\n`)
    W(`  ${c.dim}  3. pilih link with phone number${c.reset}\n`)
    W(`  ${c.dim}  4. masukkan kode di atas${c.reset}\n`)

    nl()

    W(`  ${c.yellow}  catatan: kode berlaku beberapa menit${c.reset}\n`)

    sep()
    nl()

  } catch (e) {
    nl()
    row('error', e.message, c.red)
    nl()
  }
  }

  feb.pluginManager = pluginManager
  feb.prefixManager = prefixManager
  feb.botInfo       = BOT_INFO

  const coreListener = new CoreListener(feb)
  feb.coreListener   = coreListener
  coreListener.activate()

  /* ─ sendGroupStatus helper ─ */
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

  /* ─ connection events ─ */
  feb.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {

    if (qr && authMethod.method === 'qr')
      qrcode.generate(qr, { small: true })

    if (connection === 'open') {
      const botJid = feb.user?.id

if (botJid) {
  addUser(botJid, 'owner')
  console.log('✓ bot auto registered as owner:', botJid)
}
      const debugOn  = process.env.DEBUG === '1'
      const now      = new Date().toLocaleString('id-ID', {
        timeZone    : 'Asia/Jakarta',
        day         : '2-digit',
        month       : 'short',
        year        : 'numeric',
        hour        : '2-digit',
        minute      : '2-digit',
        second      : '2-digit',
        hour12      : false
      })

      console.clear()
hdr('wesker-md')

row('status', 'connected', c.green)
row('session', feb.user?.id || '-', c.white)
row('waktu', now, c.dim)

nl()

W(`  ${c.bold}akses${c.reset}\n`)
W(`  ${c.dim}  private mode · hanya user dengan role yang bisa menggunakan bot${c.reset}\n`)
W(`  ${c.dim}  gunakan command ${c.white}access${c.reset}${c.dim} untuk mengatur user${c.reset}\n`)

nl()

W(`  ${c.bold}logs${c.reset}\n`)

if (debugOn) {
  W(`  ${c.green}  aktif${c.reset}  ${c.dim}semua event akan tampil di console${c.reset}\n`)
  W(`  ${c.dim}  ketik ${c.white}debug off${c.reset}${c.dim} untuk mematikan logs${c.reset}\n`)
} else {
  W(`  ${c.yellow}  nonaktif${c.reset}  ${c.dim}console tidak menampilkan aktivitas bot${c.reset}\n`)
  W(`  ${c.dim}  ketik ${c.white}debug on${c.reset}${c.dim} untuk mengaktifkan logs${c.reset}\n`)
}

sep()
nl()
    }
    if (connection === 'close') {
      const status = lastDisconnect?.error instanceof Boom
        ? lastDisconnect.error.output.statusCode
        : null

      if (status === DisconnectReason.loggedOut) {
        fs.rmSync('./auth', { recursive: true, force: true })
        nl()
        row('auth', 'sesi berakhir · file auth dihapus · restart untuk login ulang', c.red)
        nl()
        process.exit(0)
      }

      row('status', 'koneksi terputus · mencoba reconnect dalam 3 detik...', c.yellow)
      nl()
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
