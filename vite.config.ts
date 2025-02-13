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
  };
});
