import { readdirSync, readFileSync, statSync } from 'node:fs'

const config = JSON.parse(readFileSync('public/demo-experience.json', 'utf8'))
const referenced = new Set(['/lilco-logo.png', '/demo-experience.mind', '/target-embeddings.json'])

for (const experience of config) {
  for (const field of ['targetImageUrl', 'glbModelUrl']) {
    const value = experience[field]
    if (typeof value === 'string' && value.startsWith('/')) referenced.add(value)
  }
}

const assets = readdirSync('public')
  .filter((name) => /\.(?:glb|mind|png)$/i.test(name))
  .map((name) => ({ name, bytes: statSync(`public/${name}`).size, used: referenced.has(`/${name}`) }))

const total = assets.reduce((sum, asset) => sum + asset.bytes, 0)
const orphaned = assets.filter((asset) => !asset.used)

console.table(assets.map((asset) => ({
  asset: asset.name,
  status: asset.used ? 'referenced' : 'orphan candidate',
  MiB: (asset.bytes / 1024 / 1024).toFixed(2),
})))
console.log(`Tracked assets: ${(total / 1024 / 1024).toFixed(2)} MiB`)
console.log(`Orphan candidates: ${orphaned.map((asset) => asset.name).join(', ') || 'none'}`)
