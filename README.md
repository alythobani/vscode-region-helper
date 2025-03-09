<!-- markdownlint-disable no-inline-html -->

# Region Helper

[![VSCode Marketplace](https://img.shields.io/visual-studio-marketplace/v/AlyThobani.region-helper?label=VSCode%20Marketplace)](https://marketplace.visualstudio.com/items?itemName=AlyThobani.region-helper)

A [Visual Studio Code](https://marketplace.visualstudio.com/items?itemName=AlyThobani.region-helper) extension for **navigating, visualizing, and managing code regions**.

<h2 id="-features-at-a-glance">⚡️ Features at a glance</h2>

- 📁 **Regions View** – Interactive tree for navigating regions.
- 🏛 **Full Outline View** – Unified interactive tree for regions and language symbols.
- ⚠ **Diagnostics** – Detects unmatched region boundaries.
- 🐇 **Quick Navigation** – Jump, search, and select regions with commands.

![Region Helper Demo](./assets/readme-gifs/0-main-demo.gif)

<h2 id="-table-of-contents">📖 Table of Contents</h2>

1. [⚡️ Features at a glance](#-features-at-a-glance)
2. [📖 Table of Contents](#-table-of-contents)
3. [🔬 Features in detail](#-features-in-detail)
   1. [📂 Regions View](#regions-view)
   2. [🏛 Full Outline View](#-full-outline-view)
   3. [⚠ Region Diagnostics](#-region-diagnostics)
   4. [🔍 Go to Region...](#-go-to-region)
   5. [🐇 Go to Region Boundary](#-go-to-region-boundary)
   6. [⏭ Go to Next / Previous Region](#-go-to-next--previous-region)
   7. [🎯 Select Current Region](#-select-current-region)
4. [⚙️ Settings](#-settings)
   1. [🙈 Show/Hide Views](#-showhide-views)
   2. [🔧 Custom Region Patterns](#-custom-region-patterns)
5. [🚀 Installation](#-installation)
6. [🚧 Known Limitations](#-known-limitations)
7. [❤️ Contributing \& Feedback](#-contributing--feedback)

<h2 id="-features-in-detail">🔬 Features in detail</h2>

<h3 id="regions-view">📂 Regions View</h3>

- Displays a **structured tree view** of all regions in the current file.
- **Automatically highlights** the cursor’s active region.
- Click a region to **instantly navigate** to it.

![Regions View Demo](./assets/readme-gifs/1-tree-view.gif)

<h3 id="-full-outline-view">🏛 Full Outline View</h3>

- Combines all **regions and language symbols** (classes, methods, variables, etc) into a **unified tree view** for the current file.
- Just like the Regions View, the cursor's active region/symbol is **automatically highlighted**, and you can **click to navigate** to any item.

<h3 id="-region-diagnostics">⚠ Region Diagnostics</h3>

- Detects **unmatched region boundaries** and adds warnings in both the editor (blue squiggles) and the Problems panel, helping you **catch incomplete or misplaced** regions quickly.

![Region Diagnostics Demo](./assets/readme-gifs/2-diagnostics.gif)

<h3 id="-go-to-region">🔍 Go to Region...</h3>

- Like VSCode’s built-in **"Go to Symbol..."**, but for regions:
  - Opens a **fuzzy-searchable dropdown** to jump to any region in the current file.
- 📌 **Default Keybinding**:
  - **Windows/Linux**: `Ctrl + Shift + R`
  - **Mac**: `Cmd + Shift + R`

![Go to Region Demo](./assets/readme-gifs/3-go-to-region.gif)

<h3 id="-go-to-region-boundary">🐇 Go to Region Boundary</h3>

- Like VSCode’s built-in **"Go to Bracket"**, but for regions:
  - Jumps between **matching start and end region boundaries**.
  - Jumps to the **next region** if the cursor is not already inside a region.
- 📌 **Default Keybinding**: `Alt + M`

![Go to Region Boundary Demo](./assets/readme-gifs/4-boundary.gif)

<h3 id="-go-to-next--previous-region">⏭ Go to Next / Previous Region</h3>

- Jumps to the **next or previous region** in the file.
- 📌 **Default Keybindings**:
  - **Next Region**: `Ctrl + Alt + N`
  - **Previous Region**: `Ctrl + Alt + P`

![Go to Next / Previous Region Demo](./assets/readme-gifs/5-prev-next.gif)

<h3 id="-select-current-region">🎯 Select Current Region</h3>

- Selects the **entire active region** containing the cursor.
- 📌 **Default Keybinding**: `Alt + Shift + M`

![Select Current Region Demo](./assets/readme-gifs/6-select.gif)

<h2 id="-settings">⚙️ Settings</h2>

<h3 id="-showhide-views">🙈 Show/Hide Views</h3>

To quickly show or hide the **Regions** or **Full Outline** views, you can use the following commands and associated settings:

- **Show/Hide Region View**
  - Commands: `Show Regions View` / `Hide Regions View`
  - Setting: `region-helper.shouldShowRegionsView`
- **Show/Hide Full Outline View**
  - Commands: `Show Full Outline View` / `Hide Full Outline View`
  - Setting: `region-helper.shouldShowFullOutlineView`

<h3 id="-custom-region-patterns">🔧 Custom Region Patterns</h3>

- **Supports nearly 50 languages** out of the box, including:
  - **C, C++, C#, Java, Python, JavaScript, JSX, TypeScript, TSX, PHP, Ruby, Swift, Go, Rust, HTML, XML, Markdown, JSON/JSONC, YAML, SQL, and more**.
- Define your own **custom region patterns**, or adjust the **existing default patterns**, to customize how regions are parsed.
  - Setting: `region-helper.regionBoundaryPatternByLanguageId`

<h2 id="-installation">🚀 Installation</h2>

1. **[Install Region Helper](https://marketplace.visualstudio.com/items?itemName=AlyThobani.region-helper)** from the VSCode Marketplace.
2. ???
3. **Profit!**

<h2 id="-known-limitations">🚧 Known Limitations</h2>

- 🔍 **Go to Region...** only supports **camelCase matching** (not full fuzzy search) due to a [VSCode API limitation](https://github.com/microsoft/vscode/issues/34088#issuecomment-328734452).
- The 📁 **Regions** and 🏛 **Full Outline** tree views **always highlight the cursor's last active item**, even when outside any region/symbol ([another VSCode API limitation](https://github.com/microsoft/vscode/issues/48754)).

<h2 id="-contributing--feedback">❤️ Contributing & Feedback</h2>

I may have limited availability, but **bug reports, suggestions, and contributions** are always welcome! Feel free to:

- **[File an issue](https://github.com/alythobani/vscode-region-helper/issues/new/choose)** for bugs or feature requests.
- **[Browse issues open to PRs](https://github.com/alythobani/vscode-region-helper/issues?q=state%3Aopen%20label%3A%22accepting%20PRs%22)** and submit one if you'd like to help.
- **[Leave a review](https://marketplace.visualstudio.com/items?itemName=alythobani.region-helper&ssr=false#review-details)** to share your thoughts. Be honest, but do be kind too—I'm just one person trying to make a free and useful tool for myself and others. 😸

---

Hope you enjoy using **Region Helper**! Have a great day, and try to make someone else's day great too. 😊
