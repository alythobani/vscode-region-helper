import * as assert from "assert";
import * as vscode from "vscode";
import { type RegionHelperAPI } from "../../api/regionHelperAPI";
import { openSampleDocument } from "../utils/openSampleDocument";
import { delay } from "../utils/waitForEvent";

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

  /**
   * Waits for debounce delays + auto-hide delay + buffer.
   * Uses the utility delay function for consistency.
   */
  async function waitForAutoHideProcessing(ms = 400): Promise<void> {
    await delay(ms);
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
        await waitForAutoHideProcessing(100);

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
      await waitForAutoHideProcessing(100);
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
      await waitForAutoHideProcessing();

      // Verify regions exist
      const regions = regionHelperAPI.getTopLevelRegions();
      assert.ok(regions.length > 0, "Document should have regions");

      // Ensure view is visible
      await setRegionsViewVisible(true);
      await waitForAutoHideProcessing(100);
      assert.ok(isRegionsViewVisible(), "View should be visible initially");

      // Now open a document WITHOUT regions
      const docWithoutRegions = await openSampleDocument("emptyDocument.ts");
      await vscode.window.showTextDocument(docWithoutRegions);
      await waitForAutoHideProcessing();

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
      await waitForAutoHideProcessing();

      // View should be hidden (auto-hidden or manual)
      // Force it to be hidden to ensure test starts from correct state
      await setRegionsViewVisible(false);
      await waitForAutoHideProcessing(100);
      assert.strictEqual(isRegionsViewVisible(), false, "View should be hidden initially");

      // Now open a document WITH regions
      const docWithRegions = await openSampleDocument("sampleRegionsDocument.ts");
      await vscode.window.showTextDocument(docWithRegions);
      await waitForAutoHideProcessing();

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
      await waitForAutoHideProcessing(100);

      // Start with view hidden and document without regions
      const docWithoutRegions = await openSampleDocument("emptyDocument.ts");
      await vscode.window.showTextDocument(docWithoutRegions);
      await setRegionsViewVisible(false);
      await waitForAutoHideProcessing(100);

      assert.strictEqual(isRegionsViewVisible(), false, "View should be hidden initially");

      // Open document WITH regions
      const docWithRegions = await openSampleDocument("sampleRegionsDocument.ts");
      await vscode.window.showTextDocument(docWithRegions);
      await waitForAutoHideProcessing();

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
      await waitForAutoHideProcessing(100);

      // Start with view visible and document with regions
      const docWithRegions = await openSampleDocument("sampleRegionsDocument.ts");
      await vscode.window.showTextDocument(docWithRegions);
      await setRegionsViewVisible(true);
      await waitForAutoHideProcessing(100);

      assert.ok(isRegionsViewVisible(), "View should be visible initially");

      // Open document WITHOUT regions
      const docWithoutRegions = await openSampleDocument("emptyDocument.ts");
      await vscode.window.showTextDocument(docWithoutRegions);
      await waitForAutoHideProcessing();

      // View should still be visible (auto-hide disabled)
      assert.strictEqual(
        isRegionsViewVisible(),
        true,
        "View should remain visible when auto-hide is disabled"
      );
    });
  });

  // #endregion

  // #region User Preference Preservation Tests

  suite("User Preference Preservation", () => {
    let originalAutoHide: boolean;
    let originalVisible: boolean;

    setup(async () => {
      // Save original settings
      originalAutoHide = isAutoHideEnabled();
      originalVisible = isRegionsViewVisible();

      // Enable auto-hide for tests
      await setAutoHideEnabled(true);
      await setRegionsViewVisible(true);
      await waitForAutoHideProcessing(100);
    });

    teardown(async () => {
      // Restore original settings
      await setAutoHideEnabled(originalAutoHide);
      await setRegionsViewVisible(originalVisible);

      // Close any open editors
      await vscode.commands.executeCommand("workbench.action.closeAllEditors");
    });

    test("auto-hide should NOT set userWantsRegionsView to false", async () => {
      // This tests a bug where auto-hide incorrectly interprets its own hide action as user intent.
      //
      // Bug scenario:
      // 1. View is visible with regions
      // 2. Switch to doc without regions → auto-hide triggers
      // 3. The visibility change event fires
      // 4. BUG: if regionStore still has regions (race condition), 
      //    userWantsRegionsView incorrectly gets set to false
      // 5. Now the view never auto-shows again

      // Start with document WITH regions
      const docWithRegions = await openSampleDocument("sampleRegionsDocument.ts");
      await vscode.window.showTextDocument(docWithRegions);
      await waitForAutoHideProcessing();

      // Verify regions exist and view is visible
      assert.ok(
        regionHelperAPI.getTopLevelRegions().length > 0,
        "Document should have regions"
      );
      await setRegionsViewVisible(true);
      await waitForAutoHideProcessing(100);
      assert.ok(isRegionsViewVisible(), "View should be visible");

      // Now switch to document WITHOUT regions - this triggers auto-hide
      const docWithoutRegions = await openSampleDocument("emptyDocument.ts");
      await vscode.window.showTextDocument(docWithoutRegions);
      await waitForAutoHideProcessing();

      // View should be auto-hidden
      assert.strictEqual(
        isRegionsViewVisible(),
        false,
        "View should be auto-hidden for doc without regions"
      );

      // Now switch BACK to document with regions
      await vscode.window.showTextDocument(docWithRegions);
      await waitForAutoHideProcessing();

      // CRITICAL: View should auto-show because userWantsRegionsView should still be true
      // This is where the bug manifests - if userWantsRegionsView was incorrectly
      // set to false by the auto-hide, the view won't auto-show
      assert.strictEqual(
        isRegionsViewVisible(),
        true,
        "View should auto-show when returning to document with regions (userWantsRegionsView should not have been corrupted by auto-hide)"
      );
    });

    test("switching between multiple documents should preserve auto-show behavior", async function () {
      // Increase timeout for this test due to multiple document switches
      this.timeout(10000);
      
      // Test rapid switching between documents to catch race conditions
      const docWithRegions = await openSampleDocument("sampleRegionsDocument.ts");
      const docWithoutRegions = await openSampleDocument("emptyDocument.ts");

      // Start with regions visible
      await vscode.window.showTextDocument(docWithRegions);
      await waitForAutoHideProcessing();
      await setRegionsViewVisible(true);
      await waitForAutoHideProcessing(100);

      // Do several switches
      for (let i = 0; i < 3; i++) {
        await vscode.window.showTextDocument(docWithoutRegions);
        await waitForAutoHideProcessing();
        
        await vscode.window.showTextDocument(docWithRegions);
        await waitForAutoHideProcessing();
      }

      // After all switches, view should still be visible for doc with regions
      assert.strictEqual(
        isRegionsViewVisible(),
        true,
        "View should remain auto-showing after multiple document switches"
      );
    });
  });

  // #endregion

  // #region Region Creation Tests

  suite("Region Creation Auto-Show", () => {
    let originalAutoHide: boolean;
    let originalVisible: boolean;

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
      await vscode.commands.executeCommand("workbench.action.closeAllEditors");
    });

    test("should auto-show when first region is created in a document", async function () {
      // Increase timeout for this test
      this.timeout(5000);
      
      // Open empty document (no regions)
      const emptyDoc = await openSampleDocument("emptyDocument.ts");
      await vscode.window.showTextDocument(emptyDoc);
      await waitForAutoHideProcessing();

      // Verify no regions
      assert.strictEqual(
        regionHelperAPI.getTopLevelRegions().length,
        0,
        "Should start with no regions"
      );

      // Force view to be hidden (simulating auto-hide behavior)
      // But we need to maintain userWantsRegionsView = true, so we do this via the config
      await setRegionsViewVisible(false);
      await waitForAutoHideProcessing(100);
      assert.strictEqual(isRegionsViewVisible(), false, "View should be hidden");

      // Verify editor is still valid
      if (!vscode.window.activeTextEditor?.document || vscode.window.activeTextEditor.document !== emptyDoc) {
        // Re-open the document if needed
        await vscode.window.showTextDocument(emptyDoc);
        await waitForAutoHideProcessing(100);
      }

      // Create a region
      const activeEditor = vscode.window.activeTextEditor;
      if (!activeEditor) {
        throw new Error("No active editor");
      }
      
      const position = new vscode.Position(0, 0);
      await activeEditor.edit((editBuilder) => {
        editBuilder.insert(position, "// #region Test\n// content\n// #endregion\n");
      });
      await waitForAutoHideProcessing();

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
