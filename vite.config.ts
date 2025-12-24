import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,          // allow network access
    port: 5000,
    allowedHosts: true, // 👈 THIS
  },
});