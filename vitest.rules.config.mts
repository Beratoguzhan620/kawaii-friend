import { defineConfig } from "vitest/config";

// Security rules tests; they need the Firestore emulator (see `pnpm test:rules`).
export default defineConfig({
  test: {
    include: ["tests/rules/**/*.test.ts"],
    environment: "node",
    testTimeout: 15000,
    fileParallelism: false,
  },
});
