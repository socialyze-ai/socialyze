import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import svgr from "vite-plugin-svgr";

// https://vitejs.dev/config/
export default defineConfig({
  esbuild: {
    drop: process.env.MODE === "production" ? ["console", "debugger"] : [],
  },
  define: {
    global: {},
  },
  resolve: {
    alias: {
      "@components": path.resolve(__dirname, "src/components"),
      "@hooks": path.resolve(__dirname, "src/hooks"),
      "@assets": path.resolve(__dirname, "src/assets"),
      "@pages": path.resolve(__dirname, "src/pages"),
      "@popups": path.resolve(__dirname, "src/popups"),
      "@utils": path.resolve(__dirname, "src/utils"),
      "@slices": path.resolve(__dirname, "src/redux/slices"),
    },
  },
  plugins: [svgr(), react()],
  // server: {
  //   https: {
  //     key: './certs/cert.key',
  //     cert: './certs/cert.crt',
  //   },
  //   host: '127.0.0.1'
  // },
});
