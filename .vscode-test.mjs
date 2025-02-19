import { defineConfig } from "@vscode/test-cli";

export default defineConfig({
  files: "dist-tests/**/*.test.js",
  installExtensions: [
    "haskell.haskell",
    "jakebecker.elixir-ls",
    "mathiasfrohlich.kotlin",
    "mquandalle.graphql",
    "pgourlain.erlang",
    "tamasfe.even-better-toml",
  ],
});
