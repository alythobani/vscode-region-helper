import { defineConfig } from "@vscode/test-cli";

export default defineConfig({
  files: "dist-tests/**/*.test.js",
  installExtensions: [
    "alefragnani.pascal",
    "chee.vscode-perl6-atom-grammar",
    "haskell.haskell",
    "jakebecker.elixir-ls",
    "mathiasfrohlich.kotlin",
    "mquandalle.graphql",
    "ocamllabs.ocaml-platform",
    "pgourlain.erlang",
    "svelte.svelte-vscode",
    "sysoev.language-stylus",
    "tamasfe.even-better-toml",
    "Vue.volar",
  ],
});
