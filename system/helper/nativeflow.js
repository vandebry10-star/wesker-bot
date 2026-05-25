// wesker-bot · febry.is-a.dev · github.com/vandebry10-star/wesker-bot


import crypto from 'node:crypto'

const NATIVE_FLOW_NODES = [
  {
    tag: 'biz',
    attrs: {},
    content: [
      {
        tag: 'interactive',
        attrs: { type: 'native_flow', v: '1' },
        content: [
          {
            tag: 'native_flow',
            attrs: { v: '9', name: 'mixed' }
          }
        ]
      }
    ]
  }
]

export async function sendNativeFlow(feb, jid, content, options = {}) {
  const { quoted, messageId } = options

  await feb.relayMessage(jid, content, {
    messageId: messageId || crypto.randomUUID(),
    additionalNodes: NATIVE_FLOW_NODES,
    ...(quoted ? { quoted } : {})
  })
}
