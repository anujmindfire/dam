/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  envDir: "../../",
  resolve: {
    alias: {
      "@dam/shared": path.resolve(__dirname, "../../packages/shared/src"),
    },
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    // Required when running behind nginx inside Kubernetes.
    // Vite 5+ rejects requests whose Host header doesn't match its own
    // bind address. The gateway forwards the external host (127.0.0.1:42633),
    // which Vite treats as invalid and drops the connection → 502.
    allowedHosts: "all",
    // Setting origin to empty string prevents Vite from injecting an
    // absolute origin into HMR WebSocket URLs, which breaks when accessed
    // through the nginx proxy at a different address.
    origin: "",
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    css: true,
  },
});
