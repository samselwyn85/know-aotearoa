import path from "node:path";
import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
  plugins: [viteReact(), tailwindcss(), viteSingleFile()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  define: {
    "import.meta.env.VITE_OFFLINE": JSON.stringify("true"),
    "import.meta.env.VITE_AUTH_ENABLED": JSON.stringify("false"),
  },
  build: {
    outDir: "dist-html",
    emptyOutDir: true,
    cssCodeSplit: false,
    assetsInlineLimit: 100000000,
    rollupOptions: {
      input: path.resolve(__dirname, "offline.html"),
    },
  },
});
