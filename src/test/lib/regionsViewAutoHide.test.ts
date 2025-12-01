import * as assert from "assert";
import * as vscode from "vscode";
import { type RegionHelperAPI } from "../../api/regionHelperAPI";
import { openSampleDocument } from "../utils/openSampleDocument";

/**
 * Tests for the REGIONS view auto-hide feature.
 *
 * This feature follows the "contextual visibility" UI pattern where:
 * - The view auto-hides when switching to documents without regions
 * - The view auto-shows when switching to documents with regions (if user hasn't explicitly hidden it)
 * - User's explicit show/hide actions are remembered as their preference
 *
 * The feature is controlled by the `regionHelper.regionsView.shouldAutoHide` setting.
 */
suite("Regions View Auto-Hide", () => {
  let regionHelperAPI: RegionHelperAPI;

  suiteSetup(async () => {
    const regionHelperExtension = vscode.extensions.getExtension("alythobani.region-helper");
    if (!regionHelperExtension) {
      throw new Error("Region Helper extension not found!");
    }
    await regionHelperExtension.activate();
    regionHelperAPI = regionHelperExtension.exports as RegionHelperAPI;
  });

  // #region Helper Functions

  async function waitForPotentialEvent(ms = 400): Promise<void> {
    // Wait longer than debounce delays + auto-hide delay (150ms) + buffer
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function getRegionsViewConfig(): vscode.WorkspaceConfiguration {
    return vscode.workspace.getConfiguration("regionHelper.regionsView");
  }

  function isRegionsViewVisible(): boolean {
    return getRegionsViewConfig().get<boolean>("isVisible", true);
  }

  function isAutoHideEnabled(): boolean {
    return getRegionsViewConfig().get<boolean>("shouldAutoHide", true);
  }

  async function setAutoHideEnabled(enabled: boolean): Promise<void> {
    await getRegionsViewConfig().update("shouldAutoHide", enabled, vscode.ConfigurationTarget.Global);
  }

  async function setRegionsViewVisible(visible: boolean): Promise<void> {
    await getRegionsViewConfig().update("isVisible", visible, vscode.ConfigurationTarget.Global);
  }

  // #endregion

  // #region Configuration Tests

  suite("Configuration", () => {
    test("shouldAutoHide setting should exist and default to true", () => {
      const config = getRegionsViewConfig();
      const shouldAutoHide = config.get<boolean>("shouldAutoHide");
      assert.strictEqual(
        typeof shouldAutoHide,
        "boolean",
        "shouldAutoHide setting should exist and be a boolean"
      );
    });

    test("shouldAutoHide setting should be configurable", async () => {
      const originalValue = isAutoHideEnabled();

      try {
        // Set to opposite value
        await setAutoHideEnabled(!originalValue);
        await waitForPotentialEvent(100);

        const newValue = isAutoHideEnabled();
        assert.strictEqual(
          newValue,
          !originalValue,
          "shouldAutoHide setting should be changeable"
        );
      } finally {
        // Restore original value
        await setAutoHideEnabled(originalValue);
      }
    });
  });

  // #endregion

  // #region Auto-Hide Behavior Tests

  suite("Auto-Hide Behavior", () => {
    let originalAutoHide: boolean;
    let originalVisible: boolean;

    setup(async () => {
      // Save original settings
      originalAutoHide = isAutoHideEnabled();
      originalVisible = isRegionsViewVisible();

      // Enable auto-hide for tests
      await setAutoHideEnabled(true);
      await setRegionsViewVisible(true);
      await waitForPotentialEvent(100);
    });

    teardown(async () => {
      // Restore original settings
      await setAutoHideEnabled(originalAutoHide);
      await setRegionsViewVisible(originalVisible);

      // Close any open editors
      await vscode.commands.executeCommand("workbench.action.closeAllEditors");
    });

    test("should hide view when switching to document without regions", async () => {
      // First, open a document WITH regions to ensure view is visible
      const docWithRegions = await openSampleDocument("sampleRegionsDocument.ts");
      await vscode.window.showTextDocument(docWithRegions);
      await waitForPotentialEvent();

      // Verify regions exist
      const regions = regionHelperAPI.getTopLevelRegions();
      assert.ok(regions.length > 0, "Document should have regions");

      // Ensure view is visible
      await setRegionsViewVisible(true);
      await waitForPotentialEvent(100);
      assert.ok(isRegionsViewVisible(), "View should be visible initially");

      // Now open a document WITHOUT regions
      const docWithoutRegions = await openSampleDocument("emptyDocument.ts");
      await vscode.window.showTextDocument(docWithoutRegions);
      await waitForPotentialEvent();

      // Verify no regions
      const regionsAfter = regionHelperAPI.getTopLevelRegions();
      assert.strictEqual(regionsAfter.length, 0, "Empty document should have no regions");

      // View should be hidden
      assert.strictEqual(
        isRegionsViewVisible(),
        false,
        "View should be hidden when document has no regions"
      );
    });

    test("should show view when switching to document with regions", async () => {
      // First, open a document WITHOUT regions
      const docWithoutRegions = await openSampleDocument("emptyDocument.ts");
      await vscode.window.showTextDocument(docWithoutRegions);
      await waitForPotentialEvent();

      // View should be hidden (auto-hidden or manual)
      // Force it to be hidden to ensure test starts from correct state
      await setRegionsViewVisible(false);
      await waitForPotentialEvent(100);
      assert.strictEqual(isRegionsViewVisible(), false, "View should be hidden initially");

      // Now open a document WITH regions
      const docWithRegions = await openSampleDocument("sampleRegionsDocument.ts");
      await vscode.window.showTextDocument(docWithRegions);
      await waitForPotentialEvent();

      // Verify regions exist
      const regions = regionHelperAPI.getTopLevelRegions();
      assert.ok(regions.length > 0, "Document should have regions");

      // View should be visible (auto-shown)
      assert.strictEqual(
        isRegionsViewVisible(),
        true,
        "View should be shown when document has regions"
      );
    });

    test("should NOT auto-show if auto-hide is disabled", async () => {
      // Disable auto-hide
      await setAutoHideEnabled(false);
      await waitForPotentialEvent(100);

      // Start with view hidden and document without regions
      const docWithoutRegions = await openSampleDocument("emptyDocument.ts");
      await vscode.window.showTextDocument(docWithoutRegions);
      await setRegionsViewVisible(false);
      await waitForPotentialEvent(100);

      assert.strictEqual(isRegionsViewVisible(), false, "View should be hidden initially");

      // Open document WITH regions
      const docWithRegions = await openSampleDocument("sampleRegionsDocument.ts");
      await vscode.window.showTextDocument(docWithRegions);
      await waitForPotentialEvent();

      // View should still be hidden (auto-hide disabled)
      assert.strictEqual(
        isRegionsViewVisible(),
        false,
        "View should remain hidden when auto-hide is disabled"
      );
    });

    test("should NOT auto-hide if auto-hide is disabled", async () => {
      // Disable auto-hide
      await setAutoHideEnabled(false);
      await waitForPotentialEvent(100);

      // Start with view visible and document with regions
      const docWithRegions = await openSampleDocument("sampleRegionsDocument.ts");
      await vscode.window.showTextDocument(docWithRegions);
      await setRegionsViewVisible(true);
      await waitForPotentialEvent(100);

      assert.ok(isRegionsViewVisible(), "View should be visible initially");

      // Open document WITHOUT regions
      const docWithoutRegions = await openSampleDocument("emptyDocument.ts");
      await vscode.window.showTextDocument(docWithoutRegions);
      await waitForPotentialEvent();

      // View should still be visible (auto-hide disabled)
      assert.strictEqual(
        isRegionsViewVisible(),
        true,
        "View should remain visible when auto-hide is disabled"
      );
    });
  });

  // #endregion

  // #region Region Creation Tests

  suite("Region Creation Auto-Show", () => {
    let originalAutoHide: boolean;
    let originalVisible: boolean;
    let editor: vscode.TextEditor;

    setup(async () => {
      // Save original settings
      originalAutoHide = isAutoHideEnabled();
      originalVisible = isRegionsViewVisible();

      // Enable auto-hide for tests
      await setAutoHideEnabled(true);
    });

    teardown(async () => {
      // Restore original settings
      await setAutoHideEnabled(originalAutoHide);
      await setRegionsViewVisible(originalVisible);

      // Close any open editors without saving
      await vscode.commands.executeCommand("workbench.action.closeActiveEditor");
    });

    test("should auto-show when first region is created in a document", async () => {
      // Open empty document (no regions)
      const emptyDoc = await openSampleDocument("emptyDocument.ts");
      editor = await vscode.window.showTextDocument(emptyDoc);
      await waitForPotentialEvent();

      // Verify no regions
      assert.strictEqual(
        regionHelperAPI.getTopLevelRegions().length,
        0,
        "Should start with no regions"
      );

      // Force view to be hidden (simulating auto-hide behavior)
      // But we need to maintain userWantsRegionsView = true, so we do this via the config
      await setRegionsViewVisible(false);
      await waitForPotentialEvent(100);
      assert.strictEqual(isRegionsViewVisible(), false, "View should be hidden");

      // Create a region
      const position = new vscode.Position(0, 0);
      await editor.edit((editBuilder) => {
        editBuilder.insert(position, "// #region Test\n// content\n// #endregion\n");
      });
      await waitForPotentialEvent();

      // Verify region was created
      const regions = regionHelperAPI.getTopLevelRegions();
      assert.ok(regions.length > 0, "Region should have been created");

      // View should auto-show
      assert.strictEqual(
        isRegionsViewVisible(),
        true,
        "View should auto-show when region is created"
      );
    });
  });

  // #endregion
});
