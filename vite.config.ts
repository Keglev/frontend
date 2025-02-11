import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite Configuration File
 * This file configures Vite for a React + TypeScript project.
 * It includes plugin setup and server configurations.
 *
 * @see https://vitejs.dev/config/
 */

export default defineConfig({
  plugins: [
    react(), // Enables React support with fast refresh
  ],
  
  server: {
    /**
     * Proxy Configuration:
     * - Redirects API calls to the backend server running on localhost:8081.
     * - `changeOrigin: true` ensures the host header matches the target.
     * - `secure: false` allows self-signed SSL certificates (if needed).
     */
    proxy: {
      '/api': {
        target: 'http://localhost:8081', // Backend API URL
        changeOrigin: true, // Modifies the host header to match the target
        secure: false, // Allows connections to an HTTPS server with a self-signed certificate
      },
    },
  },
});

