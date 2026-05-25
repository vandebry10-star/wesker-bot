# Wesker-bot

---

<p align="center">
  <img src="https://cloud.yardansh.com/pyRWgM.jpg" />
</p>

---

## Requirements

- Node.js v21+ (v22 recommended)
- FFmpeg (untuk convert video ke sticker)
- Sharp (untuk convert gambar ke sticker)
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

Saat pertama jalan, kamu akan diminta pilih metode auth (pairing code atau QR). Setelah konek, nomor bot otomatis di-register sebagai owner **hanya kalau `access.json` masih kosong** (first run). Kalau sudah ada owner lain, auto-register dilewati supaya tidak overwrite. Saat sesi `loggedOut`, entry owner-bot dihapus otomatis bareng folder `auth/`.

Bot ini default private, hanya bisa diakses oleh nomor yang mendapatkan role. Gunakan `access` untuk memberikan role.

---

## Risiko & yang wajib kamu ubah sebelum production

Base ini dirancang untuk dev pribadi & belajar `interactiveMessage`. Kalau kamu publish bot ini untuk dipakai orang lain, **wajib** baca section ini.

### Owner punya akses shell + eval di VPS-mu

- `s <cmd>` (alias `shell`) jalankan perintah shell apapun di host bot  termasuk `rm`, akses file sistem, network call, dll.
- `e <code>` dan `ev <code>` jalankan JavaScript apapun pakai `AsyncFunction`  bisa load module Node, baca env, modifikasi state bot live.
- Plugin `plugin` bisa install / reload plugin dari URL atau file.

Artinya: **siapapun yang punya role `owner` di `access.json` punya RCE ke VPS-mu.** Pastikan:

1. Tidak ada nomor asing yang masuk `access.json` sebagai `owner`.
2. Kalau pengen kasih akses ke teman, kasih role `user` (tidak akses kategori `owner`).
3. Audit `access.json` rutin.

Kalau kamu mau publish bot ke umum, **disable shell/eval/plugin manager** dengan menghapus file `plugins/owner/shell.js`, `plugins/owner/eval.js`, `plugins/owner/eval-anysnc.js`, `plugins/owner/plugin.js`.

### Fake Quoted (fakeq)  disclaimer

Fitur `fakeq` bikin pesan bot terlihat seperti dikutip dari akun WhatsApp resmi (centang biru / WA Business verified). Ini efek visual aja, **tapi gampang disalahgunakan** untuk impersonate brand / lembaga / bank dalam scam dan phishing.

Pemakaian fitur ini sepenuhnya tanggung jawab user. Penulis tidak bertanggung jawab atas penyalahgunaan. Defaultnya `on` untuk demo  kalau ragu, `fakeq off`.

### Dev workflow  restart kalau habis edit banyak plugin

Hot-reload pakai `import('?update=' + Date.now())`  Node ESM tidak punya cara unload modul, jadi tiap reload menambah modul baru di memori. Untuk sesi dev panjang yang banyak edit plugin, restart bot via `reload` atau pm2 restart sesekali biar RAM nggak menumpuk.

### File sensitif di `system/cache/`

`access.json` punya JID owner kamu  **jangan commit ke repo public**. Sudah ada di `.gitignore`, tapi pastikan tidak ke-track dari sejarah lama (`git log -- system/cache/access.json`).

---

## Struktur

```
wesker-bot/
├── index.js                         entry point utama
├── launcher.js                      process wrapper dengan auto-restart
├── package.json
├── plugins/
│   ├── owner/
│   │   ├── debug.js                 toggle debug log
│   │   ├── eval.js                  eval javascript (cmd: e)
│   │   ├── eval-anysnc.js           eval dengan output verbose (cmd: ev)
│   │   ├── inspect-message.js       inspect raw message object (cmd: im)
│   │   ├── plugin.js                plugin manager (install, reload, check, dll)
│   │   ├── reload.js                reload semua plugin + diff snapshot
│   │   └── shell.js                 jalankan shell command (cmd: s)
│   ├── example/
│   │   ├── beton.js                 contoh penggunaan nativeflow button
│   │   ├── esce.js                  contoh interactive message dengan header image
│   │   └── master.js                contoh lengkap semua fitur plugin (full komen)
│   ├── info/
│   │   ├── botinfo.js               status bot dan server realtime
│   │   ├── getid.js                 cek JID sender dan chat
│   │   ├── health.js                monitor cpu dan ram realtime
│   │   ├── info.js                  info server dan memori
│   │   ├── ping.js                  cek latency queue, handler, dan network
│   │   ├── runtime.js               uptime bot
│   │   ├── speedtest.js             cek kecepatan internet server
│   │   └── spek.js                  spesifikasi server lengkap dengan chart
│   ├── menu/
│   │   ├── allmenu.js               tampilkan semua list menu
│   │   ├── help.js                  daftar command
│   │   ├── hidden.js                lihat command yang disembunyikan
│   │   └── menu.js                  tampilkan list kategori menu
│   ├── system/
│   │   ├── access.js                manage role user
│   │   ├── fakeq.js                 toggle fake quoted wa verified
│   │   ├── lock.js                  lock/unlock bot global
│   │   ├── prefix.js                ganti prefix bot runtime
│   │   ├── rcmd.js                  reaction command manager
│   │   └── unaccess.js              lepas akses diri sendiri
│   └── tools/
│       ├── afk.js                   set status away from keyboard
│       ├── lid.js                   ambil LID target
│       ├── sticker.js               convert gambar/video ke sticker
│       └── up.js                    upload media ke tmpfiles/uguu/catbox
└── system/
    ├── handler/
    │   ├── message-upsert.js        inti handler semua pesan masuk
    │   └── presence-update.js       handler presence event
    ├── helper/
    │   ├── access.js                role-based access control berbasis JSON
    │   ├── afk-store.js             in-memory store untuk status AFK
    │   ├── cache/
    │   │   └── debug.json
    │   ├── config-cache.js          persistent config cache berbasis JSON
    │   ├── custom-ctx.js            builder context info untuk interactive message
    │   ├── debug.js                 debug logger toggle
    │   ├── download-media.js        download media dari message Baileys
    │   ├── fakeq.js                 state manager untuk fitur fakeq
    │   ├── feb-patch.js             patch socket untuk inject fake quoted contextInfo
    │   ├── index.js                 BOT_INFO, sleep, formatTime, formatSeconds
    │   ├── lock.js                  state manager global lock
    │   ├── nativeflow.js            helper kirim interactiveMessage / nativeFlowMessage
    │   ├── quoted-text.js           kirim dan edit pesan dengan custom quoted context
    │   ├── reaction-cmd.js          mapping emoji ke command (rcmd)
    │   ├── send.js                  shorthand semua tipe pengiriman pesan
    │   ├── sticker.js               convert image/video ke webp sticker
    │   ├── util.js                  utility umum
    │   ├── wesker-album.js          kirim albumMessage dengan delay antar gambar
    │   └── wesker-message.js        universal sender (text, image, document, dll)
    ├── listener/
    │   ├── core-listener.js         kelola semua event Baileys dan teruskan ke classifier
    │   ├── event-classifier.js      kategorisasi tipe event sebelum diproses handler
    │   └── event-logger.js          logger event in-RAM (ring buffer max 1000/category)
    ├── manager/
    │   ├── index.js                 export semua manager
    │   ├── plugin.js                plugin manager dengan hot-reload
    │   ├── prefix.js                manage prefix command runtime
    │   ├── reaction.js              command yang ditrigger dari reaction emoji
    │   └── user.js                  user state manager
    ├── store/
    │   └── message-store.js         in-memory message store berdasarkan ID
    ├── cache/
    │   ├── access.json              daftar role user (gitignored)
    │   ├── fakeq.json               state fakeq (gitignored)
    │   ├── lock.json                state global lock (gitignored)
    │   └── reaction-cmd.json        mapping rcmd (gitignored)
    ├── patch-message-before-send.js
    └── serialize.js                 serializer pesan masuk
```

---

## Access Control

Role system berbasis file JSON di `system/cache/access.json`.

Ada tiga role: `owner` (akses penuh), `user` (tidak bisa akses kategori owner), dan tidak terdaftar (ditolak).

```
access                     lihat daftar access
access owner (reply)       add role owner
access user (reply)        add role user
unaccess me                lepas akses diri sendiri (user)
```

## Saat pertama konek, bot otomatis mendaftarkan nomor bot sebagai owner  hanya kalau `access.json` masih kosong.

Contoh isi `access.json` yang benar
```json
$ cat system/cache/access.json
{
  "628xxxxxx:1@s.whatsapp.net": "owner",
  "115xxxxxxxxxxx@lid": "owner",
  "239xxxxxxxxxxx@lid": "user"
}
```

---

### system/handler

Isi `message-upsert.js` adalah inti dari seluruh bot. Semua pesan yang masuk diproses di sini, dari quick reply, native flow response, reaction, sampai command biasa. Sudah handle semua edge case termasuk `@lid` format dan `viewOnceMessage` wrapper.

### system/helper

Kumpulan utility yang dipakai oleh handler dan plugin. Yang paling sering dipakai:

- `send.js` shorthand semua tipe pesan, sudah di-inject ke `m` jadi bisa langsung `m.sendText()`, `m.sendSticker()`, dll
- `sticker.js` convert buffer gambar ke webp via sharp, dan video ke webp animated via ffmpeg
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
    await react('ok')
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
| `wesker` | instance PluginManager |
| `other.storeMessage` | akses ke message store |

Send helpers yang sudah di-inject ke `m`:

| method | fungsi |
|--------|--------|
| `m.reply(text)` | balas pesan dengan teks |
| `m.sendText(text, opts)` | kirim teks |
| `m.sendImage(buffer/url, caption, opts)` | kirim gambar |
| `m.sendVideo(buffer/url, caption, opts)` | kirim video |
| `m.sendSticker(buffer, opts)` | kirim sticker dari buffer |
| `m.sendDocument(buffer, fileName, opts)` | kirim dokumen |
| `m.sendLocation(lat, lng, name, opts)` | kirim lokasi |
| `m.sendContact(number, name, opts)` | kirim kontak |
| `m.sendButtons(body, footer, buttons, opts)` | kirim quick reply buttons |
| `m.forwardMsg(rawMsg)` | forward pesan |
| `m.deleteMsg(targetKey)` | hapus pesan |

Opsi `sendSticker`:

```js
m.sendSticker(buffer, { type: 'image' })   // dari gambar (default)
m.sendSticker(buffer, { type: 'video' })   // dari video, jadi animated webp
m.sendSticker(buffer, { type: 'sticker' }) // buffer webp langsung kirim
m.sendSticker(buffer, { crop: true })      // crop tengah jadi square
```

---

## Native Flow

Helper `nativeflow.js` mempermudah pembuatan interactive message WhatsApp tanpa harus nulis boilerplate `additionalNodes` setiap saat.

```js
import { sendNativeFlow } from '../../system/helper/nativeflow.js'

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

## plugin example button bisa cek `plugins/example/beton.js`, contoh lengkap semua fitur plugin ada di `plugins/example/master.js`

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

Cara kerjanya: setiap pesan keluar di-intercept oleh `feb-patch.js` yang meng-inject `contextInfo` dengan `participant: '0@s.whatsapp.net'`. Kalau `fakeq off`, patch dilewati dan bot kirim pesan normal.

```js
// di message-upsert.js
const patchedFeb = isFakeQEnabled() ? patchFeb(feb, m) : feb
```

State-nya persistent via `system/cache/fakeq.json`.
<p align="center">
  <img src="https://cloud.yardansh.com/xAN2yf.jpg" />
</p>

---

## Plugins Bawaan

| plugin | command | fungsi |
|--------|---------|--------|
| ping | `ping` | cek latency queue, handler, dan network |
| runtime | `rt` | uptime bot |
| info | `info` | info server dan memori |
| botinfo | `botinfo` | status bot dan server realtime |
| spek | `spek` | spesifikasi server lengkap dengan chart |
| health | `health` | monitor cpu dan ram realtime |
| speedtest | `speed` | cek kecepatan internet server |
| getid | `gid` | cek JID sender dan chat |
| lid | `lid` | ambil LID target |
| im | `im` | inspect raw message object |
| sticker | `sticker` `stiker` `stk` | convert gambar/video ke sticker |
| up | `up` | upload media ke tmpfiles, uguu, catbox |
| lock | `lock` | lock/unlock bot global |
| fakeq | `fakeq` | toggle fake quoted wa verified |
| debug | `debug` | toggle debug log runtime |
| reload | `reload` | reload semua plugin + diff snapshot |
| rcmd | `rcmd` | reaction command manager |
| afk | `afk` | set status away from keyboard |
| hidden | `hidden` | lihat command yang disembunyikan |
| access | `access` | manage role user |
| unaccess | `unaccess` | lepas akses diri sendiri |
| e / ev | `e` `ev` | eval JavaScript langsung dari chat |
| plugin | `plugin` | plugin manager (install, reload, list, check) |
| help | `help` | daftar command |
| menu | `menu` | menampilkan list kategori |
| allmenu | `allmenu` | menampilkan semua list menu yang tersedia |
| beton | `beton` `button` | contoh semua tipe button nativeflow |
| esce | `sc` `esce` | contoh interactive message dengan header image |

---

## Credit

built by **febry wesker** on github
<p align="center">
  <img src="https://cloud.yardansh.com/Exk1TM.jpg" />
</p>

https://chat.whatsapp.com/Ed43CaXjSb3KzD6EkZyH1q

Released under the MIT License  see `LICENSE` file. Bebas pakai, modifikasi, redistribute.
