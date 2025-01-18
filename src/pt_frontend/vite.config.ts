import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';
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
  ] as Plugin[],
  resolve: {
    alias: [
      {
        find: '@/declarations',
        replacement: fileURLToPath(new URL('../declarations', import.meta.url)),
      },
      {
        find: '@',
        replacement: fileURLToPath(new URL('./src', import.meta.url)),
      },
    ],
  },
  server: {
    proxy: {
      '/api': {
        changeOrigin: true,
        target: 'http://127.0.0.1:8080',
      },
    },
  },
});
