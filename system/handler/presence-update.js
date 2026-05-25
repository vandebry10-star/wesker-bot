// wesker-bot · febry.is-a.dev · github.com/vandebry10-star/wesker-bot


import { jidNormalizedUser } from 'baileys'

export function createPresenceHandler(feb) {
  return async function handlePresenceUpdate(update) {
    if (!update?.id || !update?.presences) return
    // presence handler  extend as needed
  }
}
