# Wesker-MD

WhatsApp bot base yang dibangun di atas [Baileys](https://github.com/WhiskeySockets/Baileys). Proyek ini bukan bot siap pakai, tapi framework yang bisa kamu jadikan fondasi bot kamu sendiri.

Dibangun dan dikelola dari mobile (Poco X6 Pro) via SSH ke VPS. Semua fitur yang ada di sini sudah production-tested.

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

Saat pertama jalan, kamu akan diminta pilih metode auth (pairing code atau QR), lalu setelah terkoneksi bot otomatis minta kamu input JID/LID sebagai dev pertama, jika skip maka akses hanya untuk sender atau nomor bot

bot ini default private jadi hanya bisa diakses oleh nomor yang mendapatkan role. gunakan `access` untuk memberikan role.

---

## Struktur

```
wesker-bot/
├── index.js              entry point utama
├── launcher.js           process wrapper dengan auto-restart
├── plugins/              tempat semua plugin (ada example plugin)
└── system/
    ├── handler/          message handler & presence
    ├── helper/           utility functions
    ├── listener/         event classifier & logger
    ├── manager/          plugin, prefix, reaction, user manager
    ├── store/            in-memory message store
    └── flow/             multi-step conversation flow (ini fitur eksperimen sebenernya, dihapus juga gak berpengaruh. tapi kalau dihapus jangan lupa edit entry point)
```

### system/handler

Isi `message-upsert.js` adalah inti dari seluruh bot. Semua pesan yang masuk diproses di sini, dari quick reply, native flow response, reaction, sampai command biasa. Sudah handle semua edge case termasuk `@lid` format dan `viewOnceMessage` wrapper.

### system/helper

Kumpulan utility yang dipakai oleh handler dan plugin. Yang paling sering dipakai:

- `nativeflow.js` untuk bikin interactive message (button, sheet, copy link, dll)
- `quoted-text.js` untuk kirim dan edit pesan dengan custom quoted context
- `wesker-message.js` sebagai universal sender yang bisa handle text, image, document, dan lainnya dalam satu fungsi
- `access.js` untuk role-based access control berbasis JSON
- `uploader.js` multi-endpoint file uploader dengan fallback chain otomatis

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

  async run({ m, args, reply, react, feb, chat, sender, role }) {
    await react('✅')
    reply('hello')
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
| `role` | `dev` / `user` / `null` |
| `react` | fungsi react ke pesan |
| `reply` | fungsi reply ke chat |
| `q` | quoted message shorthand |
| `raw` | raw WA message |
| `other.storeMessage` | akses ke message store |

---

## Access Control

Role system berbasis file JSON di `system/cache/access.json`.

Ada tiga role: `dev` (akses penuh), `user` (akses terbatas), dan tidak terdaftar (ditolak).

```
access <jid>        tambah user
access <jid> dev    tambah sebagai dev
unaccess <jid>      hapus akses
```

Saat pertama konek, bot otomatis minta kamu daftarkan JID/LID kamu sebagai dev pertama.

---

## Native Flow

Helper `nativeflow.js` mempermudah pembuatan interactive message WhatsApp. Mendukung semua tipe button:

- `cta_copy` untuk auto-copy teks ke clipboard
- `cta_url` untuk buka link
- `cta_call` untuk tombol telepon
- `quick_reply` untuk trigger command langsung
- `single_select` untuk dropdown list
- `limited_time_offer` untuk label dengan countdown expired

---

## Plugins Bawaan

| plugin | command | fungsi |
|--------|---------|--------|
| ping | `ping` | cek latency queue, handler, dan network |
| runtime | `rt` | uptime bot |
| info | `info` | info server dan memori |
| getid | `gid` | cek JID sender dan chat |
| im | `im` | inspect raw message object |
| sticker | `sticker` | convert gambar/video ke sticker |
| toimg | `toimg` | convert sticker ke gambar |
| tobraille | `braille` | convert gambar ke braille art |
| get | `get` | fetch URL: auto detect tipe konten |
| up | `up` | upload media ke tmpfiles, uguu, catbox |
| lock | `lock` | lock/unlock bot |
| access | `access` | tambah user |
| unaccess | `unaccess` | hapus user |
| del | `del` | hapus pesan bot |
| quote | `quote` | forward pesan sebagai quote |
| e / ev | `e` `ev` | eval JavaScript langsung dari chat |
| plugin | `plugin` | plugin manager (install, reload, list) |
| help | `help` | daftar command |

---

## Credit

built by **febry wesker**

© 2026 all rights reserved. do not resell or redistribute without permission.
