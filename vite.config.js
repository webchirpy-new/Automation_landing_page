import react from "@vitejs/plugin-react"
import { readdirSync } from "node:fs"
import { resolve } from "node:path"
import { defineConfig } from "vite"

const root = import.meta.dirname

// Multi-page build: index.html (landing page 1) plus one HTML entry per landing page 2–8
// (vsl-0N-*.html). Every page renders the same app; only the hero copy changes, chosen by
// the `data-page` attribute on #root (see src/data/landingPages.js).
const pages = readdirSync(root).filter((f) => f === "index.html" || /^vsl-\d+-.+\.html$/.test(f))

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: Object.fromEntries(pages.map((f) => [f.replace(/\.html$/, ""), resolve(root, f)])),
    },
  },
})
