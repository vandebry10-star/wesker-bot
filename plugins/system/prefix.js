// wesker-bot · febry.is-a.dev · github.com/vandebry10-star/wesker-bot


// backup prefix saat dimatikan
let _backup = []

export default {
  name       : 'prefix',
  command    : ['prefix'],
  category   : ['dev'],
  hidden     : true,
  description:
    'prefix          lihat status & list\n' +
    'prefix on       aktifkan prefix\n' +
    'prefix off      matikan prefix (no-prefix mode)\n' +
    'prefix add <p>  tambah prefix\n' +
    'prefix del <p>  hapus prefix (support index)',

  async run({ m, args, feb }) {
    const pm = feb.prefixManager
    if (!pm) return m.reply('prefixManager tidak tersedia')

    const list = pm.getAll()

    if (!args[0]) {
      const active = list.length > 0
      const out =
        `⟡ prefix manager\n\n` +
        `⟡ status ╌ ${active ? 'active' : 'off (no-prefix)'}\n` +
        `⟡ list   ╌ ${list.length ? list.map((v, i) => `${i + 1}.[${v}]`).join('  ') : '(kosong)'}\n\n` +
        `prefix on / off / add <p> / del <p|index>`
      return m.reply(out)
    }

    const [sub, val] = args

    switch (sub) {

      case 'on': {
        if (list.length > 0) return m.reply(`prefix sudah aktif: ${list.map(v => `[${v}]`).join(' ')}`)
        // restore backup atau default
        const restore = _backup.length ? _backup : ['.']
        for (const p of restore) pm.add(p)
        _backup = []
        return m.reply(`✅ prefix aktif: ${pm.getAll().map(v => `[${v}]`).join(' ')}`)
      }

      case 'off': {
        if (list.length === 0) return m.reply('prefix sudah mati')
        _backup = [...list]
        for (const p of [...list]) pm.remove(p)
        return m.reply('✅ prefix mati. bot jalan tanpa prefix')
      }

      case 'add': {
        if (!val) return m.reply('prefix apa?\ncontoh: prefix add !')
        pm.add(val)
        return m.reply(`✅ prefix [${val}] ditambahkan\nlist: ${pm.getAll().map(v => `[${v}]`).join(' ')}`)
      }

      case 'del': {
        if (!val) return m.reply('prefix apa?\ncontoh: prefix del ! atau prefix del 1')
        const current = pm.getAll()
        if (current.length <= 1) return m.reply('❌ minimal harus ada 1 prefix tersisa\npakai prefix off untuk matikan sepenuhnya')

        // support index 1-based atau value langsung
        let target = val
        const idx  = parseInt(val, 10)
        if (!isNaN(idx) && idx >= 1 && idx <= current.length) {
          target = current[idx - 1]
        }

        if (!current.includes(target)) return m.reply(`❌ prefix [${target}] tidak ditemukan`)
        pm.remove(target)
        return m.reply(`✅ prefix [${target}] dihapus\nlist: ${pm.getAll().map(v => `[${v}]`).join(' ')}`)
      }

      default:
        return m.reply(`*${sub}* tidak dikenal\npakai: on / off / add <p> / del <p|index>`)
    }
  }
}
