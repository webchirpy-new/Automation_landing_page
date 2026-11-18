import react from "@vitejs/plugin-react"
import { readdirSync } from "node:fs"
import { resolve } from "node:path"
import { defineConfig } from "vite"

const root = import.meta.dirname

// Multi-page build: index.html (landing page 1) plus one HTML entry per landing page 2–8
// (vsl-0N-*.html). Every page renders the same app; only the hero copy changes, chosen by
// the `data-page` attribute on #root (see src/data/landingPages.js).
// Pages kept out of the production build until they are approved. They still open in the dev
// server for review. Add a file name here to hold a page back.
const UNPUBLISHED = new Set([])

const pages = readdirSync(root).filter((f) => (f === "index.html" || /^vsl-\d+-.+\.html$/.test(f)) && !UNPUBLISHED.has(f))

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        ...Object.fromEntries(pages.map((f) => [f.replace(/\.html$/, ""), resolve(root, f)])),
        // Launch Kit 03 privacy notice (draft). Built to dist/privacy/index.html, so /privacy
        // works on Vercel with no config change.
        privacy: resolve(root, "privacy/index.html"),
        // Shown after a Tally form is submitted, then forwards to the Brevo meeting page (5 s).
        "thank-you": resolve(root, "thank-you/index.html"),
      },
    },
  },
})
