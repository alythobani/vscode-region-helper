# Changelog

All notable changes to the "region-helper" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and [Common Changelog](https://common-changelog.org/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-03-09

- **Add Full Outline View**: A new tree view combining **regions and language symbols**.  
- **Expose API access to Full Outline Data**, allowing other extensions to retrieve and listen to full outline items.  
- **Improve region tree UI**: Region items now use the `symbol-namespace` icon for a more **consistent look**.  
- **Enhance selection behavior**: "Select Current Region" now extends the selection to the **end of the last line**.  
- **Optimize performance**: **More robust debouncing** ensures smoother updates, especially in **large files**.  
- **Fix rare console errors** from tree updates in large files.  

## [1.0.3] - 2025-02-22

- Fixed copy in README

## [1.0.2] - 2025-02-22

- Removed unnecessary files from published package

## [1.0.0] - 2025-02-22

✨ Initial release ✨

### Added

- Interactive region tree
- Diagnostics for unmatched region boundaries
- Commands to navigate regions
  - `region-helper.goToRegionBoundary`
  - `region-helper.selectCurrentRegion`
  - `region-helper.goToRegionFromQuickPick`
  - `region-helper.goToNextRegion`
  - `region-helper.goToPreviousRegion`
- 48 languages supported by default
- Configuration settings to override/extend default region patterns
