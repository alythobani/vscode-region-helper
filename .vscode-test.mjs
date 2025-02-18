import { defineConfig } from "@vscode/test-cli";

export default defineConfig({
  files: "dist-tests/**/*.test.js",
});
