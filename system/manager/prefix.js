/* ════════════════════════════════════════════
 * Wesker-MD  ╌  febry wesker
 * ════════════════════════════════════════════
 * file    : system/manager/prefix.js
 * desc    : system › manager › prefix
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

export default class PrefixManager {
  constructor() {
    this.prefixes = ['.', '!', '#'];
  }

  getAll() {
    return this.prefixes;
  }

  add(prefix) {
    if (!this.prefixes.includes(prefix)) {
      this.prefixes.push(prefix);
    }
  }

  remove(prefix) {
    this.prefixes = this.prefixes.filter(p => p !== prefix);
  }

  has(prefix) {
    return this.prefixes.includes(prefix);
  }
}
