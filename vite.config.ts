import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";
import path from "path";

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
  // REMOVA O BLOCO build.rollupOptions.external QUE ESTAVA AQUI
  server: {
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3333',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
