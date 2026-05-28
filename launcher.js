// wesker-bot · febry.is-a.dev · github.com/vandebry10-star/wesker-bot


import { spawn }                      from 'child_process'
import { readFileSync, readdirSync }  from 'fs'
import { execSync }                   from 'child_process'
import os                             from 'os'

const c = {
  reset : '\x1b[0m',
  dim   : '\x1b[90m',
  white : '\x1b[97m',
  bold  : '\x1b[1m',
  green : '\x1b[32m',
  cyan  : '\x1b[36m',
}

const sep  = () => process.stdout.write(`${c.dim}┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄${c.reset}\n`)
const row  = (k, v) => process.stdout.write(`  ${c.dim}⟡ ${k.padEnd(10)}${c.reset}╌ ${c.white}${v}${c.reset}\n`)
const gap  = () => process.stdout.write('\n')

let pkg = { name: 'wesker-md', version: '1.4.8', author: 'febry wesker', description: '' }
try { pkg = JSON.parse(readFileSync('./package.json', 'utf8')) } catch {}

function countPlugins(dir) {
  let n = 0
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) n += countPlugins(`${dir}/${entry.name}`)
    else if (entry.name.endsWith('.js') && !entry.name.startsWith('_')) n++
  }
  return n
}

let plugins = 0
try { plugins = countPlugins('./plugins') } catch {}

let commit = ''
try { commit = execSync('git rev-parse --short HEAD 2>/dev/null').toString().trim() } catch {}

const mem     = os.totalmem()
const free    = os.freemem()
const used    = ((mem - free) / 1024 / 1024).toFixed(0)
const total   = (mem / 1024 / 1024).toFixed(0)
const cpu     = os.cpus()[0]?.model?.trim().replace(/\s+/g, ' ') || '-'
const started = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Makassar' })

console.clear()
gap()
process.stdout.write(`  ${c.bold}${c.white}${pkg.name}${c.reset}  ${c.dim}${pkg.version}${c.reset}\n`)
if (pkg.description) process.stdout.write(`  ${c.dim}${pkg.description}${c.reset}\n`)
gap()
sep()
row('author',  pkg.author || '-')
row('node',    process.version)
row('os',      `${os.type()} ${os.arch()}`)
row('cpu',     cpu)
row('memory',  `${used} / ${total} MB`)
if (commit) row('commit', commit)
sep()
row('plugins', `${plugins} file`)
row('stack',   'baileys · esm')
row('time',    started)
sep()
gap()
process.stdout.write(`  ${c.green}⟡${c.reset} ${c.dim}starting...${c.reset}\n`)
gap()

let restarts = 0

function startBot() {
  const child = spawn('node', ['index.js'], {
    stdio: 'inherit',
    shell: true
  })

  child.on('exit', code => {
    if (code !== 0) {
      restarts++
      process.stdout.write(`\n  ${c.dim}⟡ exit (${code}) · restart #${restarts} in 3s${c.reset}\n`)
      setTimeout(startBot, 3000)
    } else {
      process.stdout.write(`\n  ${c.dim}⟡ exited cleanly${c.reset}\n`)
    }
  })
}

startBot()
