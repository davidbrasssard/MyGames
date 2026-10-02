import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    // Old tablets (Chrome 80 and up to the modern cut-off) get the legacy bundle; newer ones get the normal one.
    legacy({ targets: ['chrome >= 80'] }),
    VitePWA({
      // 'prompt': a new version waits until src/kit/updates.ts applies it (only on Home); we register it ourselves.
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon-180.png'],
      manifest: {
        name: 'Oasis',
        short_name: 'Oasis',
        description: 'Gentle, calm games.',
        lang: 'fr',
        start_url: '/',
        scope: '/',
        id: '/',
        display: 'standalone',
        display_override: ['fullscreen', 'standalone'],
        orientation: 'any',
        background_color: '#cfe8f6',
        theme_color: '#cfe8f6',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Cache everything (including the legacy bundle) so the app works fully offline.
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  build: {
    cssTarget: 'chrome80',
  },
});
