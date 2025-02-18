import { defineConfig } from "@vscode/test-cli";

export default defineConfig({
  files: "dist/src/test/**/*.test.js",
});
