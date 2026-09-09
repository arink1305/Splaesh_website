import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

const MET_UPSTREAM = 'https://api.met.no'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const userAgent =
    env.MET_USER_AGENT ?? 'Splaesh/1.0 (https://github.com/arink1305/splaesh; kontakt: arinkk@uio.no)'

  return {
    plugins: [react()],
    base: env.VITE_BASE_PATH ?? '/',
    optimizeDeps: {
      exclude: ['maplibre-gl'],
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: { maplibre: ['maplibre-gl'] },
        },
      },
    },
    server: {
      proxy: {
        '/api/met': {
          target: MET_UPSTREAM,
          changeOrigin: true,
          headers: { 'User-Agent': userAgent },
          rewrite: (path) => path.replace(/^\/api\/met/, ''),
        },
      },
    },
    test: {
      environment: 'node',
      include: ['src/**/*.test.ts'],
    },
  }
})
