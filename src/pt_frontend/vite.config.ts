/// <reference types="vitest" />
import url from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import environment from 'vite-plugin-environment';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import dotenv from 'dotenv';
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
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:4943',
        changeOrigin: true,
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
      prefix: 'VITE_CANISTER_ID_',
      defineOn: 'import.meta.env',
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
        find: '@/',
        replacement: url.fileURLToPath(new url.URL('./src/', import.meta.url)),
      },
    ],
  },
});
