import { defineConfig } from "@vscode/test-cli";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  files: "dist-tests/**/*.test.js",
  workspaceFolder: __dirname,
  installExtensions: [
    "alefragnani.pascal",
    "chee.vscode-perl6-atom-grammar",
    "cpylua.language-postcss",
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
