/* ════════════════════════════════════════════
 * Wesker-MD  ╌  febry wesker
 * ════════════════════════════════════════════
 * file    : plugins/example/master.js
 * desc    : plugin master example, full komen
 * author  : febry  ⪩  2026
 * ════════════════════════════════════════════
 *
 * ini file contoh plugin paling lengkap.
 * semua context, helper, dan cara kirim pesan
 * ada di sini dengan penjelasan tiap baris.
 *
 * setelah paham, hapus yang tidak dipakai
 * dan sesuaikan dengan kebutuhan plugin kamu.
 *
 * ════════════════════════════════════════════ */

// ── import helper ────────────────────────────
//
// sendNativeFlow dipakai kalau mau kirim
// interactiveMessage (button, dropdown, dll).
// kalau plugin kamu tidak butuh button, tidak
// perlu import ini.
//
import { sendNativeFlow } from '../../system/helper/nativeflow.js'

// febCtx dipakai untuk bikin contextInfo
// supaya interactiveMessage punya quoted ctx
// yang valid. biasanya dipakai bareng sendNativeFlow.
//
import { febCtx } from '../../system/helper/custom-ctx.js'


export default {

  // ── name ─────────────────────────────────
  //
  // nama plugin. wajib ada.
  // nama ini yang muncul di plugin list,
  // error log, dan output plugin manager.
  // tidak harus sama dengan nama file.
  //
  name: 'master',

  // ── command ──────────────────────────────
  //
  // array command yang mentrigger plugin ini.
  // bisa satu, bisa banyak (alias).
  // prefix otomatis ditambahkan oleh handler,
  // jadi di sini tidak perlu nulis / atau .
  //
  // contoh: kalau prefix '/', ketik '/master'
  //
  command: ['master', 'mst'],

  // ── category ─────────────────────────────
  //
  // array kategori untuk pengelompokan menu.
  // category 'owner' artinya hanya owner yang
  // bisa akses. selain itu, user biasa bisa.
  //
  // contoh nilai umum:
  //   'tools', 'info', 'system', 'owner', 'dev'
  //
  // kalau tidak ada category, default akses
  // untuk semua role yang terdaftar.
  //
  category: ['example'],

  // ── description ──────────────────────────
  //
  // deskripsi singkat plugin.
  // muncul di beberapa output menu/help.
  // opsional tapi dianjurkan.
  //
  description: 'plugin master example dengan full komen',

  // ── hidden ───────────────────────────────
  //
  // kalau true, plugin tidak muncul di menu/help.
  // berguna untuk plugin internal atau utility
  // yang tidak perlu diketahui user.
  // default: false (tidak perlu ditulis kalau false)
  //
  // hidden: true,

  // ── run ──────────────────────────────────
  //
  // fungsi utama yang dijalankan saat command
  // dipanggil. wajib ada. harus async.
  //
  // semua context tersedia via destructuring
  // dari parameter pertama.
  //
  async run({

    // feb  : instance socket Baileys yang sudah
    //        dipatch oleh sistem. dipakai untuk
    //        sendNativeFlow, sendMessage manual,
    //        atau akses API Baileys langsung.
    feb,

    // m    : serialized message object.
    //        isinya semua data pesan yang masuk
    //        sudah di-normalize oleh serialize.js
    //
    //        properti penting di m:
    //          m.text      : isi teks pesan
    //          m.chat      : JID chat tujuan
    //          m.sender    : JID pengirim
    //          m.isGroup   : true kalau di grup
    //          m.isOwner   : true kalau pengirim owner
    //          m.raw       : raw WA message object
    //          m.quoted    : pesan yang di-reply (kalau ada)
    //          m.reply()   : balas pesan dengan teks
    //
    //        send helpers yang sudah di-inject ke m:
    //          m.sendText(text, opts)
    //          m.sendImage(buffer/url, caption, opts)
    //          m.sendVideo(buffer/url, caption, opts)
    //          m.sendSticker(buffer, opts)
    //          m.sendDocument(buffer, fileName, opts)
    //          m.sendLocation(lat, lng, name, opts)
    //          m.sendContact(number, name, opts)
    //          m.sendButtons(body, footer, buttons, opts)
    //          m.forwardMsg(rawMsg)
    //          m.deleteMsg(targetKey)
    //
    m,

    // args : array argumen setelah command.
    //        contoh: ketik '/master hello world'
    //        maka args = ['hello', 'world']
    //        args[0] biasanya dipakai untuk sub-action.
    args,

    // react : fungsi untuk react ke pesan.
    //         contoh: await react('ok')
    //         atau  : await react('no')
    //         hanya 1 emoji per call.
    react,

    // chat  : JID tujuan pesan keluar.
    //         sama dengan m.chat.
    //         dipakai kalau perlu pass ke helper manual.
    chat,

    // sender : JID pengirim pesan masuk.
    //          sama dengan m.sender.
    sender,

    // role  : role pengirim.
    //         nilai: 'owner' | 'user' | null
    //         null artinya tidak terdaftar (harusnya
    //         sudah diblok di handler sebelum sampai sini,
    //         tapi aman untuk dicek ulang kalau perlu)
    role,

    // q     : shorthand m.quoted
    //         null kalau pesan tidak ada yang di-reply
    q,

    // raw   : raw WA message object
    //         sama dengan m.raw
    raw,

    // wesker : instance PluginManager
    //          bisa dipakai untuk interaksi antar plugin,
    //          cek daftar plugin, enable/disable command, dll
    wesker,

    // other : object tambahan dari handler
    //         other.storeMessage : akses message store
    //         dipakai untuk ambil pesan lama by ID
    other

  }) {

    // ── contoh 1: balas pesan biasa ────────
    //
    // paling simpel. m.reply() langsung balas
    // ke pesan yang memicu command.
    //
    // await m.reply('halo dari master plugin!')


    // ── contoh 2: react + reply ────────────
    //
    // react dulu, baru balas. pola umum buat
    // kasih feedback ke user saat proses.
    //
    // await react('ok')
    // await m.reply('selesai!')


    // ── contoh 3: cek args ─────────────────
    //
    // cek sub-action dari args[0].
    // kalau tidak ada args, tampilkan usage.
    //
    // if (!args[0]) {
    //   return m.reply('usage: /master <action>')
    // }
    //
    // if (args[0] === 'info') {
    //   return m.reply(`sender: ${sender}\nrole: ${role}`)
    // }


    // ── contoh 4: cek quoted ───────────────
    //
    // q adalah shorthand m.quoted.
    // null kalau tidak ada yang di-reply.
    //
    // if (!q) {
    //   return m.reply('reply ke pesan dulu')
    // }
    //
    // const quotedText = q.text || q.raw?.message?.conversation || ''
    // await m.reply(`kamu reply ke: ${quotedText}`)


    // ── contoh 5: kirim gambar ─────────────
    //
    // sendImage bisa dari buffer atau URL.
    //
    // await m.sendImage(
    //   'https://example.com/foto.jpg',
    //   'ini caption gambar'
    // )
    //
    // atau dari buffer:
    // const buf = fs.readFileSync('./foto.jpg')
    // await m.sendImage(buf, 'ini dari buffer')


    // ── contoh 6: kirim sticker ────────────
    //
    // sendSticker dari buffer.
    // opts.type bisa 'image', 'video', atau 'sticker'
    //   'image'   : konvert buffer gambar ke webp via sharp
    //   'video'   : konvert buffer video ke animated webp via ffmpeg
    //   'sticker' : buffer webp langsung kirim tanpa konversi
    // opts.crop kalau true, crop jadi square sebelum resize
    //
    // const imgBuf = fs.readFileSync('./foto.png')
    // await m.sendSticker(imgBuf, { type: 'image', crop: false })
    //
    // dari video:
    // const vidBuf = fs.readFileSync('./video.mp4')
    // await m.sendSticker(vidBuf, { type: 'video' })


    // ── contoh 7: kirim dokumen ────────────
    //
    // sendDocument kirim file apapun sebagai dokumen.
    // parameter: (buffer/url, namaFile, opts)
    //
    // await m.sendDocument(
    //   buffer,
    //   'laporan.pdf',
    //   { mimetype: 'application/pdf', caption: 'ini filenya' }
    // )


    // ── contoh 8: kirim buttons ────────────
    //
    // sendButtons pakai quick_reply buttons.
    // tiap button punya label dan id (id = command yang dipanggil)
    //
    // await m.sendButtons(
    //   'pilih aksi:',
    //   'footer teks',
    //   [
    //     { label: 'ping', id: 'ping' },
    //     { label: 'info bot', id: 'botinfo' }
    //   ]
    // )


    // ── contoh 9: nativeflow lengkap ───────
    //
    // kalau mau button lebih lengkap (cta_url, cta_copy,
    // single_select, dll) pakai sendNativeFlow langsung.
    // lihat plugins/example/beton.js untuk contoh lebih lengkap.
    //
    // const buttons = [
    //   {
    //     name: 'cta_copy',
    //     buttonParamsJson: JSON.stringify({
    //       display_text: 'copy link',
    //       copy_code: 'https://github.com/vandebry10-star/wesker-bot'
    //     })
    //   },
    //   {
    //     name: 'cta_url',
    //     buttonParamsJson: JSON.stringify({
    //       display_text: 'buka link',
    //       url: 'https://github.com/vandebry10-star/wesker-bot'
    //     })
    //   },
    //   {
    //     name: 'quick_reply',
    //     buttonParamsJson: JSON.stringify({
    //       display_text: 'ping',
    //       id: 'ping'
    //     })
    //   }
    // ]
    //
    // await sendNativeFlow(feb, chat, {
    //   viewOnceMessage: {
    //     message: {
    //       interactiveMessage: {
    //         contextInfo: febCtx(m),
    //         body: { text: 'pilih:' },
    //         footer: { text: 'wesker-bot' },
    //         nativeFlowMessage: {
    //           buttons,
    //           messageParamsJson: JSON.stringify({ v: '1' })
    //         }
    //       }
    //     }
    //   }
    // })


    // ── contoh 10: akses message store ─────
    //
    // other.storeMessage bisa ambil pesan lama by ID.
    // berguna untuk plugin yang butuh context pesan sebelumnya.
    //
    // const store = other?.storeMessage
    // if (store) {
    //   const storedMsg = await store.get(m.id)
    //   console.log(storedMsg)
    // }


    // ── contoh 11: cek role manual ─────────
    //
    // role sudah ada dari context, tapi bisa
    // dicek ulang kalau perlu logika lebih detail.
    //
    // if (role !== 'owner') {
    //   return m.reply('khusus owner')
    // }


    // ── contoh 12: try/catch yang bener ────
    //
    // selalu wrap logika yang bisa error.
    // react error di catch supaya user tau gagal.
    //
    // try {
    //   await react('ok')
    //   // ... proses ...
    //   await m.reply('berhasil!')
    // } catch (e) {
    //   await react('no')
    //   await m.reply('gagal: ' + e.message)
    // }


    // ── default output plugin ini ───────────
    //
    // ini yang dijalankan saat tidak ada contoh
    // di atas yang aktif. ganti sesuai kebutuhan.
    //
    const info = [
      `sender : ${sender}`,
      `chat   : ${chat}`,
      `role   : ${role || 'null'}`,
      `isGroup: ${m.isGroup}`,
      `args   : ${args.join(', ') || 'kosong'}`,
      `quoted : ${q ? 'ada' : 'tidak ada'}`,
    ].join('\n')

    await react('ok')
    await m.reply(`master plugin jalan!\n\n${info}`)
  }
}

