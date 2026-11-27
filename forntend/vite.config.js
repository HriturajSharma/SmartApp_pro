import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "https://server-production-4af20ab4.up.railway.app",
        changeOrigin: true,
        secure: true,
      },
    },
  },
});