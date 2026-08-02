import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    // bank.test.ts targets Node's built-in test runner (node:test), not
    // Vitest — exclude it so it isn't double-collected here.
    exclude: ["**/node_modules/**", "services/banks/bank.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
