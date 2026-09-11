import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'

const config = JSON.parse(readFileSync('public/demo-experience.json', 'utf8'))
const manifest = JSON.parse(readFileSync('scripts/demo-target-manifest.json', 'utf8'))
const sourceHash = createHash('sha256')

sourceHash.update(`mind-ar@${manifest.compilerVersion}|max=${manifest.compileMaxImageSize}\n`)
for (const experience of config) {
  sourceHash.update(`${experience.targetImageUrl}\n`)
  sourceHash.update(readFileSync(`public${experience.targetImageUrl}`))
}

const orderedSourceDigest = sourceHash.digest('hex')
const artifactDigest = createHash('sha256')
  .update(readFileSync('public/demo-experience.mind'))
  .digest('hex')

if (config.length !== manifest.targetCount) {
  throw new Error(`Target count changed (${config.length}); regenerate demo-experience.mind`)
}
if (orderedSourceDigest !== manifest.orderedSourceDigest) {
  throw new Error('Target images or their order changed; regenerate demo-experience.mind')
}
if (artifactDigest !== manifest.artifactDigest) {
  throw new Error('demo-experience.mind does not match its validated manifest')
}
if (config[0].targetSetVersion !== `mindar-${manifest.compilerVersion}-${orderedSourceDigest.slice(0, 16)}`) {
  throw new Error('targetSetVersion does not match the ordered source digest')
}

// target-embeddings.json is derived from the same source images (a MobileNet
// embedding of each target's diagram-only region, used to disambiguate which
// target MindAR is looking at — see src/pages/AR.jsx). Since it's keyed off
// the same ordered source digest, a source-image or ordering change that
// isn't followed by `npm run targets:generate-embeddings` fails here too.
const embeddingsDigest = createHash('sha256')
  .update(readFileSync('public/target-embeddings.json'))
  .digest('hex')
if (embeddingsDigest !== manifest.embeddingsArtifactDigest) {
  throw new Error('public/target-embeddings.json does not match its validated manifest — run `npm run targets:generate-embeddings`')
}

console.log(`Target artifact passed: ${manifest.targetCount} ordered targets (+ embeddings artifact)`)
