// wesker-bot · febry.is-a.dev · github.com/vandebry10-star/wesker-bot


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
