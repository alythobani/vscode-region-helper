# Region Helper

A <!-- [Visual Studio Code](https://marketplace.visualstudio.com/region-helper) --> **Visual Studio Code** extension for navigating, visualizing, and managing **code regions** in your files. Provides an **interactive tree view**, **diagnostics warnings for unmatched region boundary markers**, and **convenient commands** for jumping, searching, and selecting regions.

## Features

### 📂 Region Tree View

- Displays a structured **tree view of all regions** in the active file.
- **Automatically highlights** the cursor’s active region.
- Click a region to instantly **navigate to it**.

### ⚠️ Region Diagnostics

- Detects **unmatched region boundary markers** (start or end) and **adds warnings** to those lines and to the **Problems** panel.
- Helps **catch incomplete or misplaced** regions quickly.

### 🐇 Go to Region Boundary (Command)

- Like VSCode’s built-in **"Go to Bracket"**, but for regions.
- Jumps between **matching region start and end boundaries**.
- 📌 **Default keybinding**: `Alt + M`

### 🔍 Go to Region (Command)

- Opens a **fuzzy-searchable dropdown** to jump to any region in the active file.
- 📌 **Default keybinding**:
  - **Windows/Linux**: `Ctrl + Shift + R`
  - **Mac**: `Cmd + Shift + R`

### 🎯 Select Current Region (Command)

- Selects the **entire region** the cursor is currently inside.
- 📌 **Default keybinding**: `Alt + Shift + M`

### ⚙️ Custom Region Patterns

- Supports **almost 50 languages** out of the box, including:
  - **C, C++, C#, Java, Python, JavaScript, JSX, TypeScript, TSX, PHP, Ruby, Swift, Go, Rust, HTML, XML, Markdown, YAML, SQL, and more**.
- Users can **define custom region patterns** in settings for **unsupported languages**, or to **override/extend default patterns**.

<!-- ## 🚀 Installation

1. **[Download Region Helper](https://marketplace.visualstudio.com/region-helper)** from the VSCode Marketplace.
2. **Reload VSCode** after installation.
3. **Enjoy faster region navigation** and better code organization! -->

## ❤️ Contributing & Feedback

My capacity may be limited, but **bug reports, suggestions, and contributions** are always welcome! Feel free to:

- **[Open an issue](https://github.com/alythobani/vscode-region-helper/issues/new/choose)**
- Submit a **pull request** for issues marked as [`accepting PRs`](https://github.com/alythobani/vscode-region-helper/issues?q=state%3Aopen%20label%3A%22accepting%20PRs%22).

Hope you enjoy using **Region Helper**. Have a great day, and try to make someone else's day great too! 😊
