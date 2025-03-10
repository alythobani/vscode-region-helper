# Changelog

All notable changes to the "region-helper" extension will be documented in this file.

This changelog adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) and is structured for clarity and readability, inspired by [Common Changelog](https://common-changelog.org/) and [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.1.0] - 2025-03-09

- **Add Full Outline View**: A new tree view combining **regions and language symbols**.
- **Expose API access to Full Outline Data**, allowing other extensions to retrieve and listen to full outline items.
- **Improve region tree UI**: Region items now use the `symbol-namespace` icon for a more **consistent look**.
- **Enhance selection behavior**: "Select Current Region" now extends the selection to the **end of the last line**.
- **Optimize performance**: **More robust debouncing** ensures smoother updates, especially in **large files**.
- **Reduce console errors** from tree updates in large files.

## [1.0.3] - 2025-02-22

- Fix README copy

## [1.0.2] - 2025-02-22

- Remove unnecessary files from the published package

## [1.0.0] - 2025-02-22

✨ Initial release ✨

- **Introduce Interactive Region Tree**, allowing easy navigation of code regions.
- **Add diagnostics for unmatched region boundaries**, helping catch incomplete or misplaced regions.
- **Add commands for quick region navigation**:
  - `region-helper.goToRegionBoundary`
  - `region-helper.selectCurrentRegion`
  - `region-helper.goToRegionFromQuickPick`
  - `region-helper.goToNextRegion`
  - `region-helper.goToPreviousRegion`
- **Support 48 languages** out of the box.
- **Enable custom region patterns** via configuration settings.
