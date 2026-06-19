import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/auth": "http://127.0.0.1:4000",
      "/colleges": "http://127.0.0.1:4000",
      "/billing": "http://127.0.0.1:4000",
      "/notifications": "http://127.0.0.1:4000",
      "/imports": "http://127.0.0.1:4000",
      "/users": "http://127.0.0.1:4000",
      "/api": "http://127.0.0.1:4000",
    },
  },
});
