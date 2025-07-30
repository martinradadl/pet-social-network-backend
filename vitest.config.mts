import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    dir: "src/tests",
    coverage: {
      provider: "istanbul",
      reporter: ["text", "json", "html"],
    },
  },
});