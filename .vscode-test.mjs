import { defineConfig } from "@vscode/test-cli";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  files: "dist-tests/**/*.test.js",
  workspaceFolder: __dirname,
  // Use isolated installation to avoid conflicts with user's global extensions
  useInstallation: {
    fromMachine: false,
  },
  // Extensions needed to recognize various file types for language ID tests
  // Use lighter-weight syntax-only extensions where possible to avoid language server noise
  installExtensions: [
    "alefragnani.pascal",
    "chee.vscode-perl6-atom-grammar",
    "cpylua.language-postcss",
    "haskell.haskell",
    "mjmcloug.vscode-elixir", // Syntax-only, no language server
    "mathiasfrohlich.kotlin",
    "mquandalle.graphql",
    "ocamllabs.ocaml-platform",
    "yuce.erlang-otp", // Syntax-only, no language server
    "svelte.svelte-vscode",
    "sysoev.language-stylus",
    "tamasfe.even-better-toml",
    "Vue.volar",
  ],
});
