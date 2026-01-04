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
  // Using syntax-only/grammar-only extensions to avoid language server noise in test output
  installExtensions: [
    // Pascal - syntax highlighting only
    "alefragnani.pascal",
    // Perl6 - grammar only
    "chee.vscode-perl6-atom-grammar",
    // PostCSS - syntax only
    "cpylua.language-postcss",
    // Haskell - use grammar-only extension instead of full language server
    "justusadam.language-haskell",
    // Elixir - syntax only (NOT elixir-ls which has language server)
    "mjmcloug.vscode-elixir",
    // Kotlin - syntax only
    "mathiasfrohlich.kotlin",
    // GraphQL - syntax only
    "mquandalle.graphql",
    // OCaml - using platform but it shouldn't start server without ocamllsp
    "ocamllabs.ocaml-platform",
    // Erlang - syntax only (NOT pgourlain.erlang which has language server)
    "yuce.erlang-otp",
    // Svelte - needed for svelte file support
    "svelte.svelte-vscode",
    // Stylus - syntax only
    "sysoev.language-stylus",
    // TOML - syntax only
    "tamasfe.even-better-toml",
    // Vue - needed for vue file support
    "Vue.volar",
  ],
});
