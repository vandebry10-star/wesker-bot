
class MessageStore {
  constructor(limit = 500) {
    this.limit = limit;
    this.store = new Map();
  }

  add(messageId, data) {
    if (!messageId) return;

    if (this.store.size >= this.limit) {
      const oldestKey = this.store.keys().next().value;
      this.store.delete(oldestKey);
    }

    this.store.set(messageId.toUpperCase(), {
      ...data,
      savedAt: Date.now()
    });
  }

  get(messageId) {
    return this.store.get(messageId?.toUpperCase()) || null;
  }

  has(messageId) {
    return this.store.has(messageId?.toUpperCase());
  }

  delete(messageId) {
    this.store.delete(messageId?.toUpperCase());
  }

  clear() {
    this.store.clear();
  }

  size() {
    return this.store.size;
  }
}

export const messageStore = new MessageStore();
