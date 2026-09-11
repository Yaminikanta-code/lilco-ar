// Generates public/target-embeddings.json — one MobileNet embedding per AR
// target, computed from the diagram-only region of each source image (the
// "lilco" logo/background is identical across every target and would make
// every embedding look alike, so it's cropped out before embedding).
//
// Runs on plain @tensorflow/tfjs (CPU backend), not @tensorflow/tfjs-node:
// tfjs-node's native binding calls a Node `util` function that newer Node
// releases removed, and this script only runs occasionally at build time, so
// the CPU backend's slower inference is not worth trading for that fragility.
import * as tf from '@tensorflow/tfjs'
import * as mobilenet from '@tensorflow-models/mobilenet'
import sharp from 'sharp'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'

const CONFIG_PATH = 'public/demo-experience.json'
const OUTPUT_PATH = 'public/target-embeddings.json'
const MOBILENET_VERSION = { version: 2, alpha: 1.0 }

// Diagram-region crop, as fractions of the full source image (x, y, w, h).
// Determined by measuring the "lilco" wordmark's right edge across all 12
// source images (max ~0.475 of width) and adding margin. Keep in sync with
// the runtime crop in src/pages/AR.jsx.
export const DIAGRAM_CROP_RECT = { x: 0.49, y: 0.0, w: 0.51, h: 1.0 }

async function cropDiagramRegion(inputPath) {
  const meta = await sharp(inputPath).metadata()
  const left = Math.round(DIAGRAM_CROP_RECT.x * meta.width)
  const top = Math.round(DIAGRAM_CROP_RECT.y * meta.height)
  const width = Math.round(DIAGRAM_CROP_RECT.w * meta.width)
  const height = Math.round(DIAGRAM_CROP_RECT.h * meta.height)
  return sharp(inputPath).extract({ left, top, width, height }).removeAlpha().raw().toBuffer({ resolveWithObject: true })
}

async function embed(model, raw) {
  const tensor = tf.tensor3d(new Uint8Array(raw.data), [raw.info.height, raw.info.width, raw.info.channels], 'int32')
  const embedding = model.infer(tensor, true) // true = penultimate-layer embedding, not classification
  // Round to 5 significant figures — plenty for cosine similarity, and keeps
  // the shipped JSON several times smaller than full float64 text precision.
  const vector = Array.from(await embedding.data()).map((v) => Number(v.toPrecision(5)))
  tensor.dispose()
  embedding.dispose()
  return vector
}

async function main() {
  const config = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'))
  const targets = config
    .map((experience, index) => ({ index, targetImageUrl: experience.targetImageUrl }))
    .filter((t) => typeof t.targetImageUrl === 'string')

  if (!targets.length) throw new Error('No experiences with targetImageUrl found in ' + CONFIG_PATH)

  console.log(`Loading MobileNet v${MOBILENET_VERSION.version} (alpha=${MOBILENET_VERSION.alpha})...`)
  const model = await mobilenet.load(MOBILENET_VERSION)

  const entries = []
  for (const target of targets) {
    const raw = await cropDiagramRegion(`public${target.targetImageUrl}`)
    const vector = await embed(model, raw)
    entries.push({ index: target.index, targetImageUrl: target.targetImageUrl, vector })
    console.log(`Embedded ${target.targetImageUrl} (dim=${vector.length})`)
  }

  const output = {
    schema: 1,
    mobilenetVersion: MOBILENET_VERSION.version,
    mobilenetAlpha: MOBILENET_VERSION.alpha,
    cropRect: DIAGRAM_CROP_RECT,
    embeddingDim: entries[0].vector.length,
    targets: entries,
  }

  writeFileSync(OUTPUT_PATH, JSON.stringify(output))

  const artifactDigest = createHash('sha256').update(readFileSync(OUTPUT_PATH)).digest('hex')
  console.log(`\nWrote ${OUTPUT_PATH} (${entries.length} targets, dim=${output.embeddingDim})`)
  console.log(`artifactDigest: ${artifactDigest}`)
  console.log('\nPaste this digest into scripts/demo-target-manifest.json as "embeddingsArtifactDigest".')
}

main().catch((err) => { console.error(err); process.exit(1) })
