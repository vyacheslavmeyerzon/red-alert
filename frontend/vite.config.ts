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
      "/kan-live": {
        target: "https://kan11w.media.kan.org.il",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/kan-live/, ""),
        secure: false,
      },
    },
  },
});
