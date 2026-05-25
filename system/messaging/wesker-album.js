// wesker-bot · febry.is-a.dev · github.com/vandebry10-star/wesker-bot


import {
  generateWAMessageFromContent,
  generateWAMessage
} from 'baileys'

const delay = ms => new Promise(r => setTimeout(r, ms))

export async function weskerSendAlbum(
  feb,
  jid,
  medias = [],
  options = {}
) {
  if (!Array.isArray(medias) || medias.length < 2) {
    throw new Error('Album minimal berisi 2 media')
  }

  const userJid = feb.user?.id
  if (!userJid) throw new Error('userJid tidak tersedia')

  const delayTime = options.delay ?? 1200
  const quoted = options.quoted
  delete options.delay

  const imageCount = medias.filter(m => m.image).length
  const videoCount = medias.filter(m => m.video).length

  const album = generateWAMessageFromContent(
    jid,
    {
      albumMessage: {
        expectedImageCount: imageCount,
        expectedVideoCount: videoCount
      }
    },
    { userJid }
  )

  await feb.relayMessage(
    jid,
    album.message,
    {
      messageId: album.key.id,
      quoted
    }
  )

  for (const media of medias) {
    const content =
      media.image
        ? { image: media.image, caption: media.caption }
        : media.video
        ? { video: media.video, caption: media.caption }
        : null

    if (!content) continue

    const msg = await generateWAMessage(
      jid,
      content,
      {
        userJid,
        upload: feb.waUploadToServer
      }
    )

    msg.message.messageContextInfo = {
      messageAssociation: {
        associationType: 1,
        parentMessageKey: album.key
      }
    }

    await feb.relayMessage(
      jid,
      msg.message,
      { messageId: msg.key.id }
    )

    await delay(delayTime)
  }

  return album
}
