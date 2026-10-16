import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // react — JSX в тестах
  plugins: [react()],
  resolve: {
    // алиас "@/..." как в tsconfig.json; задан явно, чтобы работал и в .js/.jsx тестах
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    // эмуляция браузера: document, window, localStorage
    environment: "jsdom",
    // describe / it / expect без импорта (как в Jest)
    globals: true,
    // выполняется перед каждым тестовым файлом
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx,js,jsx}"],
    // после каждого теста сбрасываем vi.fn() моки
    restoreMocks: true,
  },
});
