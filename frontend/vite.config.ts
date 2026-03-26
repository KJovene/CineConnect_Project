import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import path from "path";

export default defineConfig({
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@cineconnect/shared": path.resolve(__dirname, "../shared/src/index.ts"),
    },
  },
  optimizeDeps: {
    include: ["@cineconnect/shared"],
  },
  server: {
    host: "0.0.0.0", // Permet les connexions externes pour Docker
    port: 5173,
    watch: {
      usePolling: true, // Nécessaire pour le hot reload dans Docker
    },
  },
});
