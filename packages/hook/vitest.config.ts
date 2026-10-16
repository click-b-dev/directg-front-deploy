import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    environmentOptions: {
      jsdom: {
        url: "http://localhost",
      },
    },
    globals: true,
    include: ["src/**/*.test.{ts,tsx}"],
  },
  resolve: {
    alias: {
      "@/*": resolve(__dirname, "./src/*"),
      "@click-b/utils": resolve(__dirname, "../utils/src/index.ts"),
    },
  },
});
