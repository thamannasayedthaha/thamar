import { defineConfig } from 'vite'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        gallery: resolve(root, 'gallery.html'),
        trail: resolve(root, 'trail.html'),
        nearby: resolve(root, 'nearby.html'),
        quiz: resolve(root, 'quiz.html'),
        live: resolve(root, 'live.html'),
      },
    },
  },
})
