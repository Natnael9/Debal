import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: true,
    proxy: {
      // Forward all /api/* requests to the Fastify backend
      "/api": {
        target: "http://localhost:4001",
        changeOrigin: true,
      },
      // Proxy Socket.IO WebSocket connections
      "/socket.io": {
        target: "http://localhost:4001",
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
