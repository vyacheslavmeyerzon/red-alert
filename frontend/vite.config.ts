import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Dev proxy mirrors production nginx routing (see nginx/nginx.conf)
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
});
