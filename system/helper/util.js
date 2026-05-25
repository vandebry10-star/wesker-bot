// wesker-bot · febry.is-a.dev · github.com/vandebry10-star/wesker-bot


export function quoteContext(m) {
  return {
    stanzaId: m.id,
    participant: m.sender,
    quotedMessage: m.raw.message
  }
}

export function extractCommand(text, prefixes) {
  
  if (typeof text !== 'string') return null

  for (const prefix of prefixes) {
    if (text.startsWith(prefix)) {
      const withoutPrefix = text.slice(prefix.length).trim()
      if (!withoutPrefix) return null

      const parts = withoutPrefix.split(/\s+/)

      return {
        command: parts[0].toLowerCase(),
        args: parts.slice(1),
        prefix,
        text: withoutPrefix 
      }
    }
  }
  return null
}
