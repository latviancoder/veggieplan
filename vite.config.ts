import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import svgr from "vite-plugin-svgr";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: "build",
  },
  plugins: [
    svgr(),
    react(),
    tsconfigPaths({
      extensions: [".ts", ".tsx", ".js", ".jsx", ".mjs", ".scss"],
    }),
  ],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
