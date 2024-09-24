/// <reference types="vitest" />
import url from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { TanStackRouterVite } from "@tanstack/router-vite-plugin";
import environment from "vite-plugin-environment";
import dotenv from "dotenv";
import { exec } from "node:child_process";

dotenv.config({ path: "../../.env" });

function biomePlugin() {
  return {
    name: "vite-plugin-biome",
    handleHotUpdate({ file }) {
      exec(`npx biome format --write ${file}`, (err, stdout, stderr) => {
        if (err) {
          console.error(`Biome error: ${stderr}`);
        } else {
          console.log(`Biome output: ${stdout}`);
        }
      });
    },
  };
}

export default defineConfig({
  build: {
    emptyOutDir: true,
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:4943",
        changeOrigin: true,
      },
    },
  },
  plugins: [
    TanStackRouterVite(),
    react(),
    environment("all", { prefix: "DFX_" }),
    environment("all", { prefix: "CANISTER_" }),
    environment("all", {
      prefix: "VITE_CANISTER_ID_",
      defineOn: "import.meta.env",
    }),
    // biomePlugin(), // TODO: maybe just use an editor and fmt on CI in stead
  ],
  test: {
    environment: "jsdom",
    setupFiles: "src/setupTests.js",
  },
  resolve: {
    alias: [
      {
        find: "@/declarations",
        replacement: url.fileURLToPath(
          new url.URL("../declarations", import.meta.url),
        ),
      },
      {
        find: "@/",
        replacement: url.fileURLToPath(new url.URL("./src/", import.meta.url)),
      },
    ],
  },
});
