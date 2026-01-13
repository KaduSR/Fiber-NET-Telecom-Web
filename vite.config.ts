import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
// 1. Importe o crypto nativo do Node
import crypto from "crypto";

// 2. Adicione este bloco de correção (Polyfill) antes do defineConfig
if (typeof globalThis.crypto === "undefined") {
  // @ts-ignore
  globalThis.crypto = {
    // @ts-ignore
    getRandomValues: (arr) => crypto.randomFillSync(arr),
  };
} else if (typeof globalThis.crypto.getRandomValues === "undefined") {
  // @ts-ignore
  globalThis.crypto.getRandomValues = (arr) => crypto.randomFillSync(arr);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  define: {
    "process.env.API_KEY": JSON.stringify(process.env.API_KEY),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
  optimizeDeps: {
    include: ["@google/genai"],
  },
  server: {
    host: true,
    proxy: {
      "/api-proxy": {
        target: "https://api.centralfiber.online/",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api-proxy/, ""),
      },
    },
  },
});
