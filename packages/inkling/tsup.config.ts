import path from "node:path";
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  tsconfig: "tsconfig.json",
  // opentype.js's CommonJS entry has no named exports under Node ESM, so the ESM build is bundled in.
  noExternal: ["opentype.js"],
  esbuildOptions(options) {
    options.alias = { "@": path.resolve(__dirname, "../../src") };
    options.mainFields = ["module", "main"];
  },
});
