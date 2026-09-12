import { readFileSync, statSync } from 'node:fs'
import { gzipSync } from 'node:zlib'

const html = readFileSync('dist/index.html', 'utf8')
const entryMatch = html.match(/<script[^>]+src="([^"]+\.js)"/)

if (!entryMatch) {
  throw new Error('Could not find the production entry script in dist/index.html')
}

const entryPath = `dist/${entryMatch[1].replace(/^\.\//, '')}`
const entryBytes = readFileSync(entryPath)
const gzipBytes = gzipSync(entryBytes).byteLength
const maxEntryGzipBytes = 80 * 1024

if (gzipBytes > maxEntryGzipBytes) {
  throw new Error(`Initial JS is ${(gzipBytes / 1024).toFixed(1)} KiB gzip; budget is 80 KiB`)
}

// The experience config must ship; the target images themselves are compiled
// into a .mind file per-card at runtime only after the classify-card LLM
// step identifies which one is in view (see src/pages/AR.jsx), so unlike the
// old multi-target build there's no single precompiled .mind to check for,
// and the source images are expected to be present in dist/, not excluded.
if (!statSync('dist/demo-experience.json').size) {
  throw new Error('Required offline scanner asset is missing: dist/demo-experience.json')
}

console.log(`Build budgets passed: initial JS ${(gzipBytes / 1024).toFixed(1)} KiB gzip`)
