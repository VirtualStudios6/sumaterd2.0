import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const siteUrl = (env.VITE_SITE_URL || 'http://localhost:5173').replace(/\/$/, '')
  const categories = ['opinion', 'sociedad']
  return {
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/firebase') || id.includes('node_modules/@firebase'))
              return 'firebase'
            if (
              id.includes('react-markdown') ||
              id.includes('remark-') ||
              id.includes('rehype-') ||
              id.includes('unified')
            )
              return 'markdown'
            if (id.includes('node_modules/react') || id.includes('react-router'))
              return 'react-vendor'
          },
        },
      },
    },
    plugins: [
      {
        name: 'sumaterd-static-seo',
        generateBundle() {
          const urls = ['', ...categories.map((category) => `/categoria/${category}`)]
          this.emitFile({
            type: 'asset',
            fileName: 'sitemap.xml',
            source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((path) => `  <url><loc>${siteUrl}${path}</loc></url>`).join('\n')}\n</urlset>\n`,
          })
          this.emitFile({
            type: 'asset',
            fileName: 'robots.txt',
            source: `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /perfil\nDisallow: /login\nDisallow: /registro\nSitemap: ${siteUrl}/sitemap.xml\n`,
          })
        },
      },
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icons/icon.svg'],
        manifest: false,
        workbox: {
          navigateFallbackDenylist: [/^\/admin/, /^\/perfil/],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/firebasestorage\.googleapis\.com\//,
              handler: 'CacheFirst',
              options: {
                cacheName: 'public-images',
                expiration: { maxEntries: 80, maxAgeSeconds: 604800 },
              },
            },
          ],
        },
      }),
    ],
  }
})
