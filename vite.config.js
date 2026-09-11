import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { readFileSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'

const enableHttps = process.env.HTTPS === 'true'

const defaultExperiences = JSON.parse(readFileSync(new URL('./public/demo-experience.json', import.meta.url)))
const compiledTargetSources = defaultExperiences
  .map((experience) => experience.targetImageUrl)
  .filter((url) => typeof url === 'string' && url.startsWith('/'))
const unreferencedDemoAssets = ["/Schrodinger's Cat.png", '/photoelectric2.glb']

function excludeCompiledTargetSources() {
  return {
    name: 'exclude-compiled-target-sources',
    closeBundle() {
      for (const assetUrl of [...compiledTargetSources, ...unreferencedDemoAssets]) {
        rmSync(resolve('dist', assetUrl.slice(1)), { force: true })
      }
    },
  }
}

export default defineConfig({
  base: './',
  plugins: [react(), excludeCompiledTargetSources(), ...(enableHttps ? [basicSsl()] : [])],
  build: {
    chunkSizeWarningLimit: 600,
  },
  optimizeDeps: {
    // Only mind-ar: it needs to stay out of Vite's dev-server CJS->ESM
    // pre-bundling for its own dynamic-import/worker-loading reasons.
    // @tensorflow/tfjs and @tensorflow-models/mobilenet are plain CJS/UMD
    // packages that DO need that pre-bundling step — excluding them (as a
    // previous change did, copying this same list) sent raw `module.exports`
    // references straight to the browser, which has no `module` global
    // ("ReferenceError: module is not defined", breaking the classifier
    // entirely). Keeping them out of the app's eager entry chunk is already
    // handled by dynamic import() in preloadClassifier (src/pages/AR.jsx) —
    // Rollup code-splits on that automatically in production, independent of
    // this dev-only pre-bundling setting.
    exclude: ['mind-ar']
  },
  server: {
    historyApiFallback: true
  },
  preview: {
    historyApiFallback: true
  }
})
