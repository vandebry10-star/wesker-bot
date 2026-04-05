/* ════════════════════════════════════════════
 * Wesker-MD  ╌  febry wesker
 * ════════════════════════════════════════════
 * file    : system/helper/nativeflow.js
 * desc    : system › helper › nativeflow
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
