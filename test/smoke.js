// wesker-bot · febry.is-a.dev · github.com/vandebry10-star/wesker-bot

import PluginManager from '../system/manager/plugin.js'

const pm = new PluginManager()
await pm.loadPlugins()

const plugins = pm.getAllPlugins()
let failed = 0

if (plugins.length === 0) {
  console.error('FAIL: 0 plugin loaded')
  process.exit(1)
}

for (const p of plugins) {
  const errors = []
  if (typeof p.name !== 'string' || !p.name) errors.push('name')
  if (!Array.isArray(p.command) || p.command.length === 0) errors.push('command[]')
  if (typeof p.run !== 'function') errors.push('run()')

  if (errors.length) {
    failed++
    console.error(`FAIL · ${p.__file || p.name} · missing: ${errors.join(', ')}`)
  }
}

if (failed > 0) {
  console.error(`\n${failed}/${plugins.length} plugin invalid`)
  process.exit(1)
}

console.log(`OK · ${plugins.length} plugin loaded · ${pm.commandMap.size} command registered`)
process.exit(0)
