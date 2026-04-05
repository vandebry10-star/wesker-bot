/* ════════════════════════════════════════════
 * Wesker-MD  ╌  febry wesker
 * ════════════════════════════════════════════
 * file    : system/manager/user.js
 * desc    : system › manager › user
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

export class UserManager {
  constructor() {
    this.users = new Map();
  }
  
  add(jid, data = {}) {
    this.users.set(jid, {
      jid,
      ...data,
      firstSeen: Date.now(),
      lastSeen: Date.now()
    });
  }
  
  get(jid) {
    return this.users.get(jid);
  }
  
  update(jid, data) {
    const user = this.users.get(jid);
    if (user) {
      this.users.set(jid, { ...user, ...data, lastSeen: Date.now() });
    }
  }
  
  exists(jid) {
    return this.users.has(jid);
  }
}
