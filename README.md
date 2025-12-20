<!-- markdownlint-disable no-inline-html -->

# Region Helper

[![Current version](https://img.shields.io/visual-studio-marketplace/v/AlyThobani.region-helper)](https://marketplace.visualstudio.com/items?itemName=AlyThobani.region-helper) [![Number of installs](https://img.shields.io/visual-studio-marketplace/i/AlyThobani.region-helper)](https://marketplace.visualstudio.com/items?itemName=AlyThobani.region-helper)

A [Visual Studio Code](https://marketplace.visualstudio.com/items?itemName=AlyThobani.region-helper) extension for **navigating, visualizing, and managing code regions**.

<h2 id="-features">⚡️ Features</h2>

- 📁 **Regions View** – Interactive tree for viewing and navigating regions.
- 🏛 **Full Outline View** – Like VSCode's builtin Outline view, but incorporates regions.
- 🐇 **Quick Navigation** – Jump, search, and select regions with commands and keyboard shortcuts.
- ⚠️ **Diagnostics** – Detects unmatched region boundaries.

![Region Helper Demo](./assets/readme-gifs/0-main-demo.gif)

<h2 id="-table-of-contents">📖 Table of Contents</h2>

1. [⚡️ Features](#-features)
2. [📖 Table of Contents](#-table-of-contents)
3. [🔬 Detailed Features](#-detailed-features)
   1. [📂 Regions View](#regions-view)
   2. [🏛 Full Outline View](#-full-outline-view)
   3. [⚠️ Region Diagnostics](#-region-diagnostics)
   4. [🔍 Go to Region...](#-go-to-region)
   5. [🐇 Go to Region Boundary](#-go-to-region-boundary)
   6. [⏭ Go to Next / Previous Region](#-go-to-next--previous-region)
   7. [🎯 Select Current Region](#-select-current-region)
4. [⚙️ Settings](#-settings)
   1. [🙈 Show/Hide Views](#-showhide-views)
   2. [🔄 Toggling Auto-Highlighting in Views](#-toggling-auto-highlighting-in-views)
   3. [🔧 Custom Region Patterns](#-custom-region-patterns)
5. [📡 Extension API](#-extension-api)
6. [🚀 Installation](#-installation)
7. [🚧 Known Limitations](#-known-limitations)
8. [❤️ Contributing & Feedback](#-contributing--feedback)

<h2 id="-detailed-features">🔬 Detailed Features</h2>

<h3 id="regions-view">📂 Regions View</h3>

- Displays a **structured tree view** of all regions in the current file.
- **Automatically reveals and highlights** the cursor’s active region (this can be toggled on/off with commands/settings).
- Click a region to **instantly navigate** to it.

![Regions View Demo](./assets/readme-gifs/1-regions-view.gif)

<h3 id="-full-outline-view">🏛 Full Outline View</h3>

- Combines all **regions and language symbols** (classes, methods, variables, etc) into a **unified tree view** for the current file.
- Just like the Regions View, the cursor's active region/symbol is **automatically revealed and highlighted**, and this behavior can be toggled on/off.
- Click any item to **instantly navigate** to it.

![Full Outline View Demo](./assets/readme-gifs/2-full-outline-view.gif)

<h3 id="-region-diagnostics">⚠️ Region Diagnostics</h3>

- Detects **unmatched region boundaries** and adds warnings in both the editor (blue squiggles) and the Problems panel, helping you **catch incomplete or misplaced** regions quickly.

![Region Diagnostics Demo](./assets/readme-gifs/3-diagnostics.gif)

<h3 id="-go-to-region">🔍 Go to Region...</h3>

- Like VSCode’s built-in **"Go to Symbol..."**, but for regions:
  - Opens a **fuzzy-searchable dropdown** to jump to any region in the current file.
- 📌 **Default Keybinding**:
  - **Windows/Linux**: `Ctrl + Shift + R`
  - **Mac**: `Cmd + Shift + R`

![Go to Region Demo](./assets/readme-gifs/4-go-to-region.gif)

<h3 id="-go-to-region-boundary">🐇 Go to Region Boundary</h3>

- Like VSCode’s built-in **"Go to Bracket"**, but for regions:
  - Jumps between **matching start and end region boundaries**.
  - Jumps to the **next region** if the cursor is not already inside a region.
- 📌 **Default Keybinding**: `Alt + M`

![Go to Region Boundary Demo](./assets/readme-gifs/5-go-to-boundary.gif)

<h3 id="-go-to-next--previous-region">⏭ Go to Next / Previous Region</h3>

- Jumps to the **next or previous region** in the file.
- 📌 **Default Keybindings**:
  - **Next Region**: `Ctrl + Alt + N`
  - **Previous Region**: `Ctrl + Alt + P`

![Go to Next / Previous Region Demo](./assets/readme-gifs/6-go-to-next-previous-region.gif)

<h3 id="-select-current-region">🎯 Select Current Region</h3>

- Selects the **entire active region** containing the cursor.
- 📌 **Default Keybinding**: `Alt + Shift + M`

![Select Current Region Demo](./assets/readme-gifs/7-select-region.gif)

<h2 id="-settings">⚙️ Settings</h2>

<h3 id="-showhide-views">🙈 Show/Hide Views</h3>

To quickly show or hide the **Regions** or **Full Outline** views, you can use the following commands and associated settings:

- **Show/Hide Region View**
  - Commands: `Show Regions View` / `Hide Regions View`
  - Setting: `regionHelper.shouldShowRegionsView`
- **Show/Hide Full Outline View**
  - Commands: `Show Full Outline View` / `Hide Full Outline View`
  - Setting: `regionHelper.shouldShowFullOutlineView`

<h3 id="-toggling-auto-highlighting-in-views">🔄 Toggling Auto-Highlighting/Revealing in Tree Views</h3>

- By default, the Regions and Full Outline views will **automatically reveal and highlight** the cursor's active region or symbol as you navigate the editor.
- If you ever want to **disable this auto-revealing behavior** (e.g. for a more stable scroll position), you can use the `{Stop/Start} Auto-Highlighting Active {Region/Item}` commands, or click the tree view's **title bar action** to toggle it on/off:

![Toggle Full Outline Auto-Highlighting Title Action](./assets/readme-pics/8-auto-highlight-view-title-action.png)

<h3 id="-custom-region-patterns">🔧 Custom Region Patterns</h3>

- **Supports 50 languages** out of the box, including:
  - **C, C++, C#, Java, Python, JavaScript, JSX, TypeScript, TSX, PHP, Ruby, Swift, Go, Rust, HTML, XML, Markdown, JSON/JSONC, YAML, SQL, and more**.
- Define your own **custom region patterns**, or adjust the **existing default patterns**, to customize how regions are parsed.
  - Setting: `regionHelper.regionBoundaryPatternByLanguageId`
    - Note: you may need to restart the extension after changing this setting for it to take effect.

<h2 id="-extension-api">📡 Extension API</h2>

Region Helper provides an API for accessing **parsed code regions** and **full outline symbols** programmatically. You can use it to build your own VSCode region extension without worrying about writing a region parser from scratch!

**See the full [API documentation](./docs/API.md) for details and examples.**

<h2 id="-installation">🚀 Installation</h2>

1. **[Install Region Helper](https://marketplace.visualstudio.com/items?itemName=AlyThobani.region-helper)** from the VSCode Marketplace.
2. ???
3. **Profit!**

(Really, things should work out of the box. [Let me know](https://github.com/alythobani/vscode-region-helper/issues/new/choose) if they don't!)

<h2 id="-known-limitations">🚧 Known Limitations</h2>

- 🔍 **Go to Region...** only supports **camelCase matching** (not full fuzzy search) due to a [VSCode API limitation](https://github.com/microsoft/vscode/issues/34088#issuecomment-328734452).
- The 📁 **Regions** and 🏛 **Full Outline** tree views **always highlight the cursor's last active item**, even when outside any region/symbol ([another VSCode API limitation](https://github.com/microsoft/vscode/issues/48754)).

<h2 id="-contributing--feedback">❤️ Contributing & Feedback</h2>

I may have limited availability, but **bug reports, suggestions, and contributions** are always welcome! Feel free to:

- **[File an issue](https://github.com/alythobani/vscode-region-helper/issues/new/choose)** for bugs or feature requests.
- **[Browse issues open to PRs](https://github.com/alythobani/vscode-region-helper/issues?q=state%3Aopen%20label%3A%22accepting%20PRs%22)** and submit one if you'd like to help.
- **[Leave a review](https://marketplace.visualstudio.com/items?itemName=alythobani.region-helper&ssr=false#review-details)** to share your thoughts or overall feedback.

---

Hope you enjoy using Region Helper! Have a great day, and try to make someone else's day great too. 😊
