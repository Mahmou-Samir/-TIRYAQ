import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // 👇 السطر ده هو السر عشان يشتغل معاك وأنت بتكتب كود
      devOptions: {
        enabled: true
      },
      includeAssets: ['tiryaq-icon.png'],
      manifest: {
        name: 'Tiryaq (ترياق)',
        short_name: 'Tiryaq',
        description: 'AI-Powered Pharmacy Inventory System',
        theme_color: '#0B1120',
        background_color: '#0B1120',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: '/tiryaq-icon.png',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: '/tiryaq-icon.png',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})
