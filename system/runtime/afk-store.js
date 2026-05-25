// wesker-bot · febry.is-a.dev · github.com/vandebry10-star/wesker-bot


const store = new Map()

export function setAFK(jid, reason = '-', chat = null) {
  store.set(jid, {
    reason,
    chat,
    since: Date.now()
  })
}

export function isAFK(jid) {
  return store.has(jid)
}

export function getAFK(jid) {
  return store.get(jid) || null
}

export function clearAFK(jid) {
  store.delete(jid)
}

export function getAllAFK() {
  return [...store.entries()].map(([jid, data]) => ({ jid, ...data }))
}

