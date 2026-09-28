import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// Browsers refuse <script type="module"> from file://, so the build is one
// classic script loaded after the page body. With the relative base this lets
// dist/index.html open straight from a folder, as well as inside Pake.
const classicScript = (): Plugin => ({
  name: 'classic-script',
  apply: 'build',
  transformIndexHtml: {
    order: 'post',
    handler(html) {
      const tag = /\s*<script type="module" crossorigin src="([^"]+)"><\/script>/
      const src = html.match(tag)?.[1]
      if (!src) throw new Error('classic-script: entry script not found')
      // crossorigin turns the request into CORS, which file:// (origin null) fails
      return html.replace(tag, '').replaceAll(' crossorigin', '')
        .replace('</body>', `  <script defer src="${src}"></script>\n  </body>`)
    },
  },
})

export default defineConfig({
  base: './',
  plugins: [react(), classicScript()],
  build: {
    // The last browsers on Windows 7 lab PCs, where the dist/ folder is the fallback to the app.
    target: ['chrome109', 'edge109', 'firefox115'],
    modulePreload: false,
    cssCodeSplit: false,
    rolldownOptions: {
      output: { format: 'iife', codeSplitting: false },
    },
  },
})
