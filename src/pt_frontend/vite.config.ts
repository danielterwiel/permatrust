/// <reference types="vitest" />
import url from 'node:url';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
import { defineConfig } from 'vite';
import environment from 'vite-plugin-environment';

import { routes } from './src/routes';

dotenv.config({ path: '../../.env' });

export default defineConfig({
  build: {
    emptyOutDir: true,
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  plugins: [
    TanStackRouterVite({
      virtualRouteConfig: routes,
    }),
    react(),
    environment('all', { prefix: 'DFX_' }),
    environment('all', { prefix: 'CANISTER_' }),
    environment('all', {
      defineOn: 'import.meta.env',
      prefix: 'VITE_CANISTER_ID_',
    }),
  ],
  // test: {
  //   environment: 'jsdom',
  //   setupFiles: 'src/setupTests.js',
  // },
  resolve: {
    alias: [
      {
        find: '@/declarations',
        replacement: url.fileURLToPath(
          new url.URL('../declarations', import.meta.url),
        ),
      },
      {
        find: '@',
        replacement: url.fileURLToPath(new url.URL('./src', import.meta.url)),
      },
    ],
  },
  server: {
    proxy: {
      '/api': {
        changeOrigin: true,
        target: 'http://127.0.0.1:4943',
      },
    },
  },
});
