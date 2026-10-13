import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

// Gera um único arquivo HTML (dist/index.html) — funciona em qualquer hospedagem (Vercel)
// e também pode ser aberto direto no navegador.
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  base: "./",
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  server: { port: 5174 },
});
