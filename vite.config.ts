// vite.config.ts
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";

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
  build: {
    rollupOptions: {
      external: [
        "jspdf",
        "leaflet",
        "react-leaflet",
        "@vercel/speed-insights/react",
      ],
    },
  },
  server: {
    host: true,
    proxy: {
      "/api-proxy": {
        // 👇 AQUI: Mude de localhost para a URL de produção
        target: "https://api.centralfiber.online",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api-proxy/, ""),
      },
    },
  },
});
