import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@saas-template/contracts": path.resolve(
        __dirname,
        "../../packages/contracts/src/index.ts",
      ),
      "@saas-template/ui": path.resolve(
        __dirname,
        "../../packages/ui/src/index.ts",
      ),
    },
  },
  test: {
    environment: "node",
  },
});
