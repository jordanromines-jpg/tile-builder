/// <reference types="vitest/config" />
// Tile Steps: one entry, served from GitHub Pages at /tile-builder/. The service worker caches the whole app so it
// opens with Wi-Fi off once it has loaded once (PRODUCT.md, "Nothing leaves the iPad").
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/tile-builder/",
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: false,
      manifest: {
        name: "Tile Steps",
        short_name: "Tile Steps",
        description: "Pick a magnet-tile project you can build with your tiles, and build it, step by step.",
        display: "standalone",
        orientation: "any",
        background_color: "#FFF7EC",
        theme_color: "#FFF7EC",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,woff2,webp,png,svg,json}"],
        // 2.4: the project pictures (most of the download) are not in the install; each is kept the first time it is
        // shown, and the rest are fetched quietly once the app is idle (src/pwa.ts), so they all work offline soon after
        globIgnores: ["pictures/projects/**"],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.includes("/pictures/projects/"),
            handler: "CacheFirst",
            options: { cacheName: "project-pictures" },
          },
        ],
        maximumFileSizeToCacheInBytes: 6e6,
      },
    }),
  ],
  build: { outDir: "dist", chunkSizeWarningLimit: 1500 },
  server: { port: 5173, strictPort: true },
  test: { environment: "jsdom", include: ["src/**/*.test.{ts,tsx}"], setupFiles: ["src/test-setup.ts"] },
});
