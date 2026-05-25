// wesker-bot · febry.is-a.dev · github.com/vandebry10-star/wesker-bot


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
