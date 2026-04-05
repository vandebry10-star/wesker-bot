/* ════════════════════════════════════════════
 * Wesker-MD  ╌  febry wesker
 * ════════════════════════════════════════════
 * file    : system/flow/flow-ui.js
 * desc    : system › flow › flow-ui
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
import { proto } from 'baileys'
import { sendNativeFlow } from '../helper/nativeflow.js'

const WA_CTX = {
  participant: '0@s.whatsapp.net',
  quotedMessage: { conversation: '' }
}

function ctx(text = '') {
  return { ...WA_CTX, quotedMessage: { conversation: text } }
}

export async function flowText(feb, chat, text, triggerText = '') {
  return feb.sendMessage(chat, {
    text,
    contextInfo: ctx(triggerText)
  })
}

export async function flowButtons(feb, chat, { body, footer = 'wesker flow', buttons, triggerText = '' }) {
  const btns = buttons.map(b => ({
    name: 'quick_reply',
    buttonParamsJson: JSON.stringify({
      display_text: b.label,
      id: b.id
    })
  }))

  await sendNativeFlow(feb, chat, {
    viewOnceMessage: {
      message: {
        interactiveMessage: proto.Message.InteractiveMessage.create({
          contextInfo: ctx(triggerText),
          body: proto.Message.InteractiveMessage.Body.create({ text: body }),
          footer: proto.Message.InteractiveMessage.Footer.create({ text: footer }),
          nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
            buttons: btns,
            messageParamsJson: JSON.stringify({ in_thread_buttons_limit: btns.length })
          })
        })
      }
    }
  })
}

export async function flowSelect(feb, chat, { body, footer = 'wesker flow', btnLabel = 'Pilih', sections, triggerText = '' }) {
  await sendNativeFlow(feb, chat, {
    viewOnceMessage: {
      message: {
        interactiveMessage: proto.Message.InteractiveMessage.create({
          contextInfo: ctx(triggerText),
          body: proto.Message.InteractiveMessage.Body.create({ text: body }),
          footer: proto.Message.InteractiveMessage.Footer.create({ text: footer }),
          nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
            buttons: [
              {
                name: 'single_select',
                buttonParamsJson: JSON.stringify({
                  title: btnLabel,
                  sections: sections.map(s => ({
                    title: s.title,
                    rows: s.rows.map(r => ({
                      title: r.label,
                      description: r.desc || '',
                      id: r.id
                    }))
                  }))
                })
              }
            ]
          })
        })
      }
    }
  })
}

export async function flowConfirm(feb, chat, { body, yesId, noId, footer = 'konfirmasi', triggerText = '' }) {
  return flowButtons(feb, chat, {
    body,
    footer,
    triggerText,
    buttons: [
      { label: '✅ Ya', id: yesId },
      { label: '❌ Tidak', id: noId }
    ]
  })
}

export async function flowCopy(feb, chat, { body, footer = '', copyText, btnLabel = 'Copy', triggerText = '' }) {
  await sendNativeFlow(feb, chat, {
    viewOnceMessage: {
      message: {
        interactiveMessage: proto.Message.InteractiveMessage.create({
          contextInfo: ctx(triggerText),
          body: proto.Message.InteractiveMessage.Body.create({ text: body }),
          footer: proto.Message.InteractiveMessage.Footer.create({ text: footer }),
          nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
            buttons: [
              {
                name: 'cta_copy',
                buttonParamsJson: JSON.stringify({
                  display_text: btnLabel,
                  copy_code: copyText
                })
              }
            ],
            messageParamsJson: JSON.stringify({ in_thread_buttons_limit: 1 })
          })
        })
      }
    }
  })
}
