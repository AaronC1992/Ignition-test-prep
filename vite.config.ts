import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const repositoryName = 'chromatic-haven'
const isGitHubActions = process.env.GITHUB_ACTIONS === 'true'
const basePath = isGitHubActions ? `/${repositoryName}/` : '/'

// https://vite.dev/config/
export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['pwa-192.svg', 'pwa-512.svg'],
      manifest: {
        name: 'Chromatic Haven',
        short_name: 'Chromatic',
        description:
          'Adult coloring game for mobile and desktop with tools, saves, and export.',
        theme_color: '#f4e3cb',
        background_color: '#f4e3cb',
        display: 'standalone',
        orientation: 'any',
        scope: basePath,
        start_url: basePath,
        icons: [
          {
            src: 'pwa-192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: 'pwa-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
})
