/* ════════════════════════════════════════════
 * Wesker-MD  ╌  febry wesker
 * ════════════════════════════════════════════
 * file    : system/flows/example-flow.js
 * desc    : system › flows › example-flow
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

export default {
  id     : 'example-flow',
  trigger: 'startflow',      

  steps: [
    
    async function (ctx) {
      
      if (!ctx.get('_s0')) {
        ctx.set('_s0', true)
        await ctx.reply('step 1/3\nsiapa namamu?')
        return
      }

      const nama = ctx.text.trim()
      if (nama.length < 2) {
        ctx.error()
        await ctx.reply('nama terlalu pendek, coba lagi')
        return
      }

      ctx.set('nama', nama)
      ctx.next()
      await ctx.reply(`oke ${nama}!\nstep 2/3\nberapa umurmu?`)
    },

    async function (ctx) {
      const umur = parseInt(ctx.text)
      if (isNaN(umur) || umur < 1 || umur > 120) {
        ctx.error()
        await ctx.reply('umur tidak valid, masukkan angka (1–120)')
        return
      }

      ctx.set('umur', umur)
      ctx.next()
      await ctx.reply(
        `step 3/3 — konfirmasi:\n\n` +
        `nama : ${ctx.get('nama')}\n` +
        `umur : ${umur}\n\n` +
        `ketik *ya* untuk simpan, *tidak* untuk batal`
      )
    },

    async function (ctx) {
      const jawab = ctx.text.trim().toLowerCase()
      if (jawab === 'ya') {
        ctx.finish()    
      } else if (jawab === 'tidak') {
        await ctx.reply('dibatalkan')
        ctx.finish()
      } else {
        ctx.error()
        await ctx.reply('ketik *ya* atau *tidak*')
      }
    }
  ],

  async onStart(ctx) {
    console.log(`[FLOW:example] start | ${ctx.sender}`)
  },

  async onStep(ctx) {
    
  },

  async onFinish(ctx) {
    const nama = ctx.get('nama')
    const umur = ctx.get('umur')
    if (nama && umur) {
      await ctx.reply(`✅ tersimpan!\n\nnama : ${nama}\numur : ${umur}`)
    }
    console.log('[FLOW:example] finish | data:', ctx.data)
  },

  async onDestroy(ctx) {
    console.log(`[FLOW:example] destroy | step: ${ctx.step}`)
  }
}
