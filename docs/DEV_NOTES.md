# Project Structure

```
vscode-region-helper/
├── src/
│   ├── extension.ts          # Extension entry point
│   ├── api/                   # Public API
│   ├── commands/              # Command implementations
│   ├── config/                # Configuration management
│   ├── diagnostics/           # Region validation diagnostics
│   ├── lib/                   # Core library functions
│   ├── models/                # Type definitions
│   ├── state/                 # State management stores
│   ├── test/                  # Test files
│   ├── treeView/              # Tree view implementations
│   └── utils/                 # Utility functions
├── dist/                      # Compiled JavaScript (gitignored)
├── dist-tests/                # Compiled tests (gitignored)
├── package.json               # Extension manifest and scripts
├── tsconfig.json              # TypeScript configuration
├── webpack.config.ts          # Webpack config for main extension
└── webpack.test.config.ts     # Webpack config for tests
```

# Local Installation Guide

This guide explains how to build and install the Region Helper extension from the local repository into your VS Code installation.

## Prerequisites

1. **Node.js** (version 18.x or later)
2. **npm** (comes with Node.js)
3. **VS Code** (version 1.94.0 or later)

## Quick Start

```bash
# 1. Clone the repository (if you haven't already)
git clone https://github.com/alythobani/vscode-region-helper.git
cd vscode-region-helper

# 2. Install dependencies
npm install

# 3. Build and package the extension
npm run compile
npx @vscode/vsce package

# 4. Install the generated .vsix file
# See "Install the Extension" section below for multiple options
```

## Step-by-Step Instructions

### 1. Install Dependencies

```bash
npm install
```

This installs all required development dependencies including TypeScript, webpack, and the VS Code extension testing tools.

### 2. Build the Extension

```bash
npm run compile
```

This runs webpack to compile the TypeScript source code into JavaScript, outputting to `dist/extension.js`.

### 3. (Optional) Run Tests

```bash
npm run pretest  # Compiles tests and runs linting
npm run test     # Runs the test suite in VS Code
```

### 4. Package the Extension

Use `@vscode/vsce` (Visual Studio Code Extension Manager) to package the extension:

```bash
# Option A: Use npx (recommended, no global install needed)
npx @vscode/vsce package

# Option B: Use npm script
npm run package

# Option C: Install globally (optional)
npm install -g @vscode/vsce
vsce package
```

This creates a `.vsix` file (e.g., `region-helper-1.5.0.vsix`) in the project root.

### 5. Install the Extension

#### Option A: Via Command Line

```bash
# If 'code' (or 'code-insiders') is in your PATH:
code --install-extension region-helper-1.5.0.vsix
```

If `code` is not recognized, use **Option B** or **Option C** below instead (recommended for Windows users).

#### Option B: Via VS Code UI

1. Open VS Code
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS) to open the Command Palette
3. Type "Install from VSIX" and select **Extensions: Install from VSIX...**
4. Navigate to the `.vsix` file and select it
5. Reload VS Code when prompted

#### Option C: Via Extensions View

1. Open the Extensions view (`Ctrl+Shift+X` or `Cmd+Shift+X`)
2. Click the `...` menu (top-right of the Extensions view)
3. Select **Install from VSIX...**
4. Navigate to the `.vsix` file and select it

## Development Mode (Without Packaging)

For faster iteration during development, you can run the extension directly in the Extension Development Host:

### Using VS Code's Debugger

1. Open the project folder in VS Code
2. Press `F5` to launch the Extension Development Host
3. A new VS Code window will open with your extension loaded
4. Make changes to the source code
5. Press `Ctrl+Shift+F5` to reload the Extension Development Host

### Using Watch Mode

To automatically recompile on file changes:

```bash
npm run watch
```

Then press `F5` to launch the Extension Development Host. After making changes, press `Ctrl+Shift+F5` to reload.

## Uninstalling

To uninstall the locally installed extension:

```bash
code --uninstall-extension AlyThobani.region-helper
```

Or via the VS Code UI:
1. Open the Extensions view (`Ctrl+Shift+X`)
2. Find "Region Helper"
3. Click the gear icon and select **Uninstall**

## Troubleshooting

### "vsce: command not found"

Use `npx @vscode/vsce package` or `npm run package` instead. Alternatively, install globally with `npm install -g @vscode/vsce`.

### "code: command not found" or "code is not recognized"

The `code` command may not be in your PATH. Use one of these alternatives:
1. **Recommended:** Use the VS Code UI to install the extension (Options B or C above)
2. **Add to PATH during install:** Reinstall VS Code and check "Add to PATH" during installation
3. **Add to PATH manually:** Add VS Code's `bin` folder to your system PATH environment variable (the location varies by installation type and OS)

### Extension doesn't load

1. Check the VS Code version requirement (1.94.0 or later)
2. Check the Output panel (`View > Output`) and select "Extension Host" for error logs
3. Ensure you ran `npm run compile` successfully before packaging

### Build errors

1. Delete `node_modules` and `dist` folders
2. Run `npm install` again
3. Run `npm run compile`

### Tests fail

1. Ensure you've run `npm run compile-tests` before `npm run test`
2. Close any other VS Code windows that might interfere with the test runner

## Building for Different Platforms

The extension is platform-independent (pure JavaScript/TypeScript), so the same `.vsix` file works on Windows, macOS, and Linux.
