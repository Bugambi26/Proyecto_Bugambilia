import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Vitest solo cubre la regla de selección del chatbot (CLAUDE.md, "Stack").
// Correr con `npm test` (pasa por scripts/vitest.mjs; ver el comentario ahí).
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: { include: ["src/**/*.test.ts"], environment: "node" },
});
