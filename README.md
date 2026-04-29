# Wesker-bot

---

<p align="center">
  <img src="https://cloud.yardansh.com/pyRWgM.jpg" />
</p>

---
## Requirements

- Node.js v21+ (v22 recommended)
- PM2 (opsional, untuk process management)
- support vps dan panel

---

## Setup

```bash
git clone https://github.com/vandebry10-star/wesker-bot
cd wesker-bot
npm install
node launcher.js / npm start
```

Saat pertama jalan, kamu akan diminta pilih metode auth (pairing code atau QR), lalu setelah terkoneksi bot otomatis minta kamu input JID/LID sebagai owner pertama. Jika skip maka akses hanya untuk sender atau nomor bot.

Bot ini default private, hanya bisa diakses oleh nomor yang mendapatkan role. Gunakan `access` untuk memberikan role.

---

## Struktur

```
wesker-bot/
├── index.js              entry point utama
├── launcher.js           process wrapper dengan auto-restart
├── plugins/              tempat semua plugin
└── system/
    ├── handler/          message handler & presence
    ├── helper/           utility functions
    ├── listener/         event classifier & logger
    ├── manager/          plugin, prefix, reaction, user manager
    ├── store/            in-memory message store
    └── flow/             multi-step conversation flow
```
---
# Access Control

Role system berbasis file JSON di `system/cache/access.json`.

Ada tiga role: `owner` (akses penuh), `user` (tidak bisa akses kategori owner), dan tidak terdaftar (ditolak).

```
access                     lihat daftar access
access owner (reply)       add role owner
access user (reply)        add role user
unaccess me                lepas akses diri sendiri (user)
```

## Saat pertama konek, bot otomatis mendaftarkan nomor bot sebagai owner pertama.

Contoh isi `access.json` yang benar
```json
$ cat system/cache/access.json
─────────────────
{
  "628xxxxxx:1@s.whatsapp.net": "owner", // ini nomor bot otomatis setelah pairing
  "115xxxxxxxxxxx@lid": "owner", // ini contoh format setelah add access yang benar
  "239xxxxxxxxxxx@lid": "user" // dan ini untuk role user
}
```

---

### system/handler

Isi `message-upsert.js` adalah inti dari seluruh bot. Semua pesan yang masuk diproses di sini, dari quick reply, native flow response, reaction, sampai command biasa. Sudah handle semua edge case termasuk `@lid` format dan `viewOnceMessage` wrapper.

### system/helper

Kumpulan utility yang dipakai oleh handler dan plugin. Yang paling sering dipakai:

- `nativeflow.js` untuk bikin interactive message (button, sheet, copy link, dll)
- `quoted-text.js` untuk kirim dan edit pesan dengan custom quoted context
- `wesker-album.js` untuk kirim albumMessage, ada delay saat mengirim gambar mencegah spam
- `wesker-message.js` sebagai universal sender yang bisa handle text, image, document, dan lainnya dalam satu fungsi
- `access.js` untuk role-based access control berbasis JSON

### system/listener

`core-listener.js` mengelola semua event Baileys (messages, group update, presence) dan meneruskan ke classifier. `event-classifier.js` mengkategorikan tipe event sebelum diproses lebih lanjut, jadi handler tidak perlu penuh dengan if-else tipe pesan.

### system/manager

- `plugin.js` adalah plugin manager dengan hot-reload. Taruh file `.js` baru di `plugins/` dan bot langsung load tanpa restart.
- `prefix.js` untuk manage prefix command yang bisa diganti runtime.
- `reaction.js` untuk command yang ditrigger dari reaction emoji.

### system/store

In-memory message store yang menyimpan pesan berdasarkan ID. Dibutuhkan untuk fitur seperti quick reply, reaction command, dan akses ke pesan lama dari dalam plugin.

### system/flow

Multi-step conversation flow. Kamu bisa bikin wizard yang berjalan step-by-step dalam satu sesi percakapan. Lihat `system/flows/example-flow.js` untuk contoh implementasi.

---

## Plugin Manager

Bot ini punya hot-reload. Saat kamu taruh atau ubah file di `plugins/`, bot otomatis reload tanpa restart. Tidak perlu matikan bot setiap kali mau update plugin.

Struktur plugin minimal:

```js
export default {
  name    : 'nama plugin',
  command : ['cmd', 'alias'],
  category: ['tools'],

  async run({ m, args, react, feb, chat, sender, role }) {
    await react('✅')
    m.reply('hello')
  }
}
```

Context yang tersedia di `run()`:

| key | isi |
|-----|-----|
| `feb` | socket Baileys yang sudah di-patch |
| `m` | serialized message object |
| `args` | array argumen setelah command |
| `chat` | JID tujuan |
| `sender` | JID pengirim |
| `role` | `owner` / `user` / `null` |
| `react` | fungsi react ke pesan |
| `q` | quoted message shorthand |
| `raw` | raw WA message |
| `other.storeMessage` | akses ke message store |

---

## Native Flow

Helper `nativeflow.js` mempermudah pembuatan interactive message WhatsApp tanpa harus nulis boilerplate `additionalNodes` setiap saat.

```js
import { sendNativeFlow } from '../system/helper/nativeflow.js'

await sendNativeFlow(feb, chat, {
  viewOnceMessage: {
    message: {
      interactiveMessage: {
        body: { text: 'pilih aksi' },
        nativeFlowMessage: {
          buttons: [
            {
              name: 'cta_copy',
              buttonParamsJson: JSON.stringify({
                display_text: 'copy jid',
                copy_code: sender
              })
            },
            {
              name: 'quick_reply',
              buttonParamsJson: JSON.stringify({
                display_text: 'ping',
                id: 'ping'
              })
            }
          ]
        }
      }
    }
  }
}, { quoted: m })
```

Tipe button yang didukung:

- `cta_copy` untuk auto-copy teks ke clipboard
- `cta_url` untuk buka link
- `cta_call` untuk tombol telepon
- `quick_reply` untuk trigger command langsung
- `single_select` untuk dropdown list
- `limited_time_offer` untuk label dengan countdown expired

## plugin example button bisa cek `plugins/beton.js`

<p align="center">
  <img src="https://cloud.yardansh.com/TRnio5.jpg" />
</p>

---

## Reaction Command (rcmd)

Kamu bisa assign emoji ke command tertentu. React ke pesan mana saja dengan emoji itu, bot langsung eksekusi command-nya, seolah kamu ngetik command tersebut.

```
rcmd add 🍬 menu     assign emoji ke command
rcmd add 🥀 reload   contoh lain
rcmd list            lihat semua yang terdaftar
rcmd del 🍬          hapus
rcmd clear           hapus semua
```

Ditenagai oleh `system/helper/reaction-cmd.js` dengan persistent storage via `ConfigCache`. Mapping tersimpan di `system/cache/reaction-cmd.json` dan tetap ada setelah restart.

```js
// di dalam handler, bot cek reaction masuk
const cmd = getReactionCmd(emoji)
if (cmd) await executePlugin(cmd, ctx)
```

---

## Fake Quoted (fakeq)

Semua balasan bot secara default keliatan seperti dikutip dari akun WhatsApp resmi (centang biru). Fitur ini bisa di-toggle tanpa restart.

```
fakeq           lihat status
fakeq on        aktifkan
fakeq off       matikan
```

Cara kerjanya: setiap pesan keluar di-intercept oleh `feb-patch.js` yang meng-inject `contextInfo` dengan `participant: '0@s.whatsapp.net'`. Kalau `fakeq off`, patch dilewati dan bot kirim

</div> pesan normal.

```js
// di message-upsert.js
const patchedFeb = isFakeQEnabled() ? patchFeb(feb, m) : feb
```

State-nya persistent via `system/cache/fakeq.json`.

---
## Plugins Bawaan

| plugin | command | fungsi |
|--------|---------|--------|
| access | `access` | manage role user |
| afk | `afk` | set status away from keyboard |
| allmenu | `allmenu` | menampilkan semua list menu |
| beton | `beton` | contoh penggunaan native flow button |
| botinfo | `botinfo` | status bot dan server realtime |
| debug | `debug` | toggle debug log runtime |
| e / ev | `e` `ev` | eval JavaScript langsung dari chat |
| esce | `sc` `esce` | kirim pesan dengan interactive button |
| fakeq | `fakeq` | toggle fake quoted wa verified |
| getid | `gid` | cek JID sender dan chat |
| health | `health` | monitor cpu dan ram realtime |
| help | `help` | daftar command |
| hidden | `hidden` | lihat command yang disembunyikan |
| im | `im` | inspect raw message object |
| info | `info` | info server dan memori |
| lid | `lid` | ambil LID target |
| lock | `lock` | lock/unlock bot global |
| menu | `menu` | menampilkan list kategori |
| ping | `ping` | cek latency queue, handler, dan network |
| plugin | `plugin` | plugin manager (install, reload, list, check) |
| prefix | `prefix` | atur prefix bot |
| rcmd | `rcmd` | reaction command manager |
| reload | `reload` | reload semua plugin + diff snapshot |
| runtime | `rt` | uptime bot |
| shell | `s` | eksekusi perintah shell langsung |
| speedtest | `speed` | cek kecepatan internet server |
| spek | `spek` | spesifikasi server lengkap dengan chart |
| sticker | `sticker` | convert gambar/video ke sticker |
| unaccess | `unaccess` | lepas akses diri sendiri |
| up | `up` | upload media ke tmpfiles, uguu, catbox |

---

<div align="center">

built by [febry wesker](https://github.com/vandebry10-star)

<img src="https://cloud.yardansh.com/Exk1TM.jpg" width="100%" />

© 2026 febry wesker · all rights reserved · do not resell or redistribute without permission

