/// <reference types="vitest" />
/// <reference types="node" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import * as process from 'process'; // Ensure process is imported for TypeScript support

/**
 * Vite Configuration File
 * Configures React support, proxy settings, and environment variables.
 * @see https://vitejs.dev/config/
 */

export default defineConfig(({ mode }) => {
  // Load environment variables based on the mode (development/production)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()], // Enables React support with fast refresh

    server: {
      /**
       * Proxy Configuration:
       * - Redirects API calls to the backend server.
       * - `changeOrigin: true` ensures the host header matches the target.
       * - `secure: false` allows self-signed SSL certificates (if needed).
       */
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:8081', // Backend API URL
          changeOrigin: true,
          secure: false,
        },
      },
    },

    define: {
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL),
    },

    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: [],
    },

    // Build configuration: adjust chunking to keep the main chunk smaller and
    // improve caching of vendor libraries. We keep a warning limit slightly
    // higher than default so the CI won't fail on the 500KB warning while
    // still notifying the team when chunks are large.
    build: {
      // Increase or decrease depending on your tolerance (value in KB)
      chunkSizeWarningLimit: 800,
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Put major libraries in their own chunks so they can be cached
            // separately and to reduce the size of the application core bundle.
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom')) {
                return 'vendor-react';
              }
              if (id.includes('i18next')) {
                return 'vendor-i18next';
              }
              if (id.includes('chart.js') || id.includes('echarts') || id.includes('@ant-design')) {
                return 'vendor-charts';
              }
              // Default vendor chunk for everything else in node_modules
              return 'vendor';
            }
          }
        }
      }
    },
  };
});
