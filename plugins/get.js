/* ════════════════════════════════════════════
 * Wesker-MD — advanced url fetcher
 * febry wesker
 * ════════════════════════════════════════════ */

import axios from 'axios'
import { sendNativeFlow } from '../system/helper/nativeflow.js'
import { prepareWAMessageMedia } from 'baileys'

const SAFELINK_DOMAINS = [
'sfl.gl','s.id','lynk.id','ouo.io','ouo.press',
'shrinkme.io','gplinks.in','shortzon.com',
'bcvc.live','fc.lc','short-url.link','za.gl'
]

function isSafelink(url){
  try{
    const host=new URL(url).hostname.replace('www.','')
    return SAFELINK_DOMAINS.some(d=>host===d||host.endsWith('.'+d))
  }catch{return false}
}

function filenameFromUrl(url){
  try{
    const base=new URL(url).pathname.split('/').filter(Boolean).pop()||'file'
    return base.includes('.')?base:base+'.bin'
  }catch{return'file.bin'}
}

function formatSize(bytes){
  if(bytes<1024)return bytes+' B'
  if(bytes<1024*1024)return(bytes/1024).toFixed(1)+' KB'
  return(bytes/1024/1024).toFixed(2)+' MB'
}

function ctxOf(m){
  return{
    stanzaId:m.id,
    participant:m.sender,
    quotedMessage:m.raw.message
  }
}

function isRealHtml(buffer){
  const head=buffer.toString('utf8',0,100).trimStart()
  return /^<!DOCTYPE|^<html/i.test(head)
}

function nfMedia(contextInfo,media,type,body,footer,buttons){
  const header=
    type==='image'
      ?{hasMediaAttachment:true,imageMessage:media}
      :type==='video'
      ?{hasMediaAttachment:true,videoMessage:media}
      :{}

  return{
    viewOnceMessage:{
      message:{
        interactiveMessage:{
          contextInfo,
          header,
          body:{text:body},
          footer:{text:footer},
          nativeFlowMessage:{
            buttons,
            messageParamsJson:JSON.stringify({
              bottom_sheet:{
                list_title:'get result',
                button_title:'pilih aksi',
                in_thread_buttons_limit:0
              }
            })
          }
        }
      }
    }
  }
}

export default{

name:'get',
command:['get','gethtml_text','gethtml_file'],
category:['tools'],

async run({feb,m,args,chat,react,command}){

/* QUICK REPLY */

if(command==='gethtml_text'){
const url=args.join(' ')
const res=await axios.get(url,{responseType:'arraybuffer'})
return m.reply(Buffer.from(res.data).toString('utf8').slice(0,65000))
}

if(command==='gethtml_file'){
const url=args.join(' ')
const res=await axios.get(url,{responseType:'arraybuffer'})
return feb.sendMessage(
chat,
{document:Buffer.from(res.data),mimetype:'text/html',fileName:'response.html'},
{quoted:m.raw}
)
}

/* MAIN */

let url=args[0]

if(!url)return m.reply('url?')
if(!/^https?:\/\//.test(url))return m.reply('url harus http/https')

await react('⏳')

/* SAFELINK */

if(isSafelink(url)){

let json

try{

const res=await axios.get(
'https://api.azbry.xyz/api/tools/safelinku?url='+
encodeURIComponent(url)+
'&apikey=weskervvip'
)

json=res.data

}catch(e){

await react('❌')
return m.reply('safelink api gagal')

}

if(!json?.status){
await react('❌')
return m.reply('safelink bypass gagal')
}

await react('✅')

return m.reply(
`⟡ safelink bypass ✓
⟡ input  ╌ ${json.input}
⟡ result ╌ ${json.result}`
)

}

/* FETCH */

const t0=Date.now()

let res

try{

res=await axios.get(url,{
responseType:'arraybuffer',
headers:{'User-Agent':'Mozilla/5.0'}
})

}catch(e){

await react('❌')
return m.reply('gagal fetch')

}

const elapsed=Date.now()-t0
const type=(res.headers['content-type']||'').split(';')[0]
const buffer=Buffer.from(res.data)

const info=
`⟡ status ╌ ${res.status}
⟡ type   ╌ ${type||'-'}
⟡ size   ╌ ${formatSize(buffer.length)}
⟡ time   ╌ ${elapsed}ms
⟡ url    ╌ ${url}`

/* IMAGE */

if(type.startsWith('image/')){

const media=(await prepareWAMessageMedia(
{image:buffer},
{upload:feb.waUploadToServer}
)).imageMessage

return sendNativeFlow(
feb,
chat,
nfMedia(
ctxOf(m),
media,
'image',
info,
'image',
[
{
name:'cta_copy',
buttonParamsJson:JSON.stringify({
display_text:'copy link',
copy_code:url
})
},
{
name:'cta_url',
buttonParamsJson:JSON.stringify({
display_text:'open',
url:url,
merchant_url:url
})
}
]
)
)

}

/* VIDEO */

if(type.startsWith('video/')){

const media=(await prepareWAMessageMedia(
{video:buffer},
{upload:feb.waUploadToServer}
)).videoMessage

return sendNativeFlow(
feb,
chat,
nfMedia(
ctxOf(m),
media,
'video',
info,
'video',
[
{
name:'cta_copy',
buttonParamsJson:JSON.stringify({
display_text:'copy link',
copy_code:url
})
},
{
name:'cta_url',
buttonParamsJson:JSON.stringify({
display_text:'open',
url:url,
merchant_url:url
})
}
]
)
)

}

/* AUDIO */

if(type.startsWith('audio/')){
await feb.sendMessage(chat,{audio:buffer,mimetype:type},{quoted:m.raw})
return m.reply(info)
}

/* JSON */

if(type.includes('json')){
let pretty
try{pretty=JSON.stringify(JSON.parse(buffer.toString()),null,2)}
catch{pretty=buffer.toString()}
return m.reply((info+'\n\n'+pretty).slice(0,65000))
}

/* TEXT */

if(type.startsWith('text/plain')){
return m.reply((info+'\n\n'+buffer.toString('utf8')).slice(0,65000))
}

/* HTML */

if(type.includes('text/html')){

if(!isRealHtml(buffer)){
return feb.sendMessage(
chat,
{document:buffer,fileName:filenameFromUrl(url)},
{quoted:m.raw}
)
}

return sendNativeFlow(
feb,
chat,
{
viewOnceMessage:{
message:{
interactiveMessage:{
contextInfo:ctxOf(m),
body:{text:info},
footer:{text:'html response'},
nativeFlowMessage:{
buttons:[
{
name:'quick_reply',
buttonParamsJson:JSON.stringify({
display_text:'kirim teks',
id:`gethtml_text ${url}`
})
},
{
name:'quick_reply',
buttonParamsJson:JSON.stringify({
display_text:'file html',
id:`gethtml_file ${url}`
})
}
]
}
}
}
}
}
)

}

/* OTHER */

return feb.sendMessage(
chat,
{
document:buffer,
mimetype:type||'application/octet-stream',
fileName:filenameFromUrl(url)
},
{quoted:m.raw}
)

}
}