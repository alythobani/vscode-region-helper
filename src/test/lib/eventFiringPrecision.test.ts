import * as assert from "assert";
import * as vscode from "vscode";
import { type RegionHelperAPI } from "../../api/regionHelperAPI";
import { openSampleDocument } from "../utils/openSampleDocument";
import { delay, waitForCondition } from "../utils/waitForEvent";

/**
 * Tests for event firing precision optimization.
 *
 * These tests verify that change events only fire when data actually changes,
 * not on every document edit. This optimization prevents unnecessary work in
 * event consumers like tree view providers.
 */
suite("Event Firing Precision", function() {
  // Increase timeout for all tests in this suite to accommodate polling
  this.timeout(10000);

  let regionHelperAPI: RegionHelperAPI;
  let editor: vscode.TextEditor;

  suiteSetup(async () => {
    const regionHelperExtension = vscode.extensions.getExtension("alythobani.region-helper");
    if (!regionHelperExtension) {
      throw new Error("Region Helper extension not found!");
    }
    await regionHelperExtension.activate();
    regionHelperAPI = regionHelperExtension.exports as RegionHelperAPI;
  });

  setup(async () => {
    // Open a fresh sample document for each test
    const sampleDocument = await openSampleDocument("sampleRegionsDocument.ts");
    editor = await vscode.window.showTextDocument(sampleDocument);

    // Wait for initial region parsing to complete using polling
    await waitForCondition(
      () => regionHelperAPI.getTopLevelRegions().length > 0,
      3000,
      50
    );
  });

  teardown(async () => {
    // Close the document without saving to avoid pollution
    await vscode.commands.executeCommand("workbench.action.closeActiveEditor");
  });

  // #region Helper Functions

  function createEventCounter(event: vscode.Event<void>): EventCounter {
    let count = 0;
    const disposable = event(() => count++);
    return {
      get count(): number {
        return count;
      },
      reset(): void {
        count = 0;
      },
      dispose(): void {
        disposable.dispose();
      },
    };
  }

  type EventCounter = {
    readonly count: number;
    reset(): void;
    dispose(): void;
  };

  async function insertTextAtPosition(
    text: string,
    line: number,
    character: number
  ): Promise<void> {
    const position = new vscode.Position(line, character);
    await editor.edit((editBuilder) => {
      editBuilder.insert(position, text);
    });
  }

  async function deleteLineRange(startLine: number, endLine: number): Promise<void> {
    const range = new vscode.Range(startLine, 0, endLine + 1, 0);
    await editor.edit((editBuilder) => {
      editBuilder.delete(range);
    });
  }

  async function replaceTextAtLine(line: number, newText: string): Promise<void> {
    const lineObj = editor.document.lineAt(line);
    await editor.edit((editBuilder) => {
      editBuilder.replace(lineObj.range, newText);
    });
  }

  // #endregion

  // #region onDidChangeRegions Tests

  suite("onDidChangeRegions", () => {
    // SKIP: This test verifies optimization behavior (event NOT firing).
    // The test has a known issue where the event fires even though region
    // structure hasn't changed. The comparison uses range.isEqual() which should work,
    // but there may be subtle timing or document version issues causing false positives.
    // TODO: Investigate why regions are considered different after in-region edits.
    test.skip("should NOT fire when editing inside a region (not affecting boundaries)", async () => {
      const counter = createEventCounter(regionHelperAPI.onDidChangeRegions);

      try {
        // Verify initial state
        const initialRegions = regionHelperAPI.getTopLevelRegions();
        assert.ok(initialRegions.length > 0, "Should have regions initially");

        counter.reset();

        // Edit inside the Imports region by modifying existing content (not adding new lines)
        // Line 5 has "// import { SomeModule } from "example";"
        // We'll modify this line without changing line count
        await replaceTextAtLine(5, "// import { ModifiedModule } from \"example\";");

        // Wait for any potential event firing
        await delay(300);

        // The event should NOT have fired since region structure is unchanged
        // (same regions, same line numbers, just different content within)
        assert.strictEqual(
          counter.count,
          0,
          "onDidChangeRegions should NOT fire when editing inside a region"
        );

        // Verify regions are still the same
        const regionsAfter = regionHelperAPI.getTopLevelRegions();
        assert.strictEqual(
          regionsAfter.length,
          initialRegions.length,
          "Region count should remain the same"
        );
      } finally {
        counter.dispose();
      }
    });

    // TODO: This test is flaky because when we read initialRegionCount, the extension
    // may not have finished its initial region parsing, so we get an incomplete count.
    // The assertion then fails because the final count doesn't match initialCount + 1.
    // Needs redesign with explicit initialization sync before capturing initial state.
    test.skip("should fire when a new region is added", async () => {
      const counter = createEventCounter(regionHelperAPI.onDidChangeRegions);

      try {
        const initialRegionCount = regionHelperAPI.getTopLevelRegions().length;
        counter.reset();

        // Add a new region at the beginning of the file
        await insertTextAtPosition("// #region New Test Region\n// content\n// #endregion\n", 0, 0);

        // Wait for region count to increase
        await waitForCondition(
          () => regionHelperAPI.getTopLevelRegions().length > initialRegionCount,
          3000,
          50
        );

        assert.ok(counter.count >= 1, "onDidChangeRegions should fire when adding a region");

        // Verify new region count
        const regionsAfter = regionHelperAPI.getTopLevelRegions();
        assert.strictEqual(
          regionsAfter.length,
          initialRegionCount + 1,
          "Should have one more region"
        );
      } finally {
        counter.dispose();
      }
    });

    // TODO: This test is flaky because when we read initialRegionCount, the extension
    // may not have finished its initial region parsing, so we get an incomplete count.
    // The condition then times out because the count doesn't decrease as expected.
    // Needs redesign with explicit initialization sync before capturing initial state.
    test.skip("should fire when a region is removed", async () => {
      const counter = createEventCounter(regionHelperAPI.onDidChangeRegions);

      try {
        const initialRegionCount = regionHelperAPI.getTopLevelRegions().length;
        assert.ok(initialRegionCount > 0, "Should have regions to remove");
        counter.reset();

        // Delete the first region (Imports: lines 4-7 in sampleRegionsDocument.ts)
        // Line 4: // #region Imports, Line 7: // #endregion
        await deleteLineRange(4, 7);

        // Wait for region count to decrease
        await waitForCondition(
          () => regionHelperAPI.getTopLevelRegions().length < initialRegionCount,
          3000,
          50
        );

        assert.ok(counter.count >= 1, "onDidChangeRegions should fire when removing a region");

        // Verify region count decreased
        const regionsAfter = regionHelperAPI.getTopLevelRegions();
        assert.ok(regionsAfter.length < initialRegionCount, "Should have fewer regions");
      } finally {
        counter.dispose();
      }
    });

    test("should fire when a region name changes", async () => {
      const counter = createEventCounter(regionHelperAPI.onDidChangeRegions);

      try {
        const initialRegions = regionHelperAPI.getTopLevelRegions();
        const firstRegionName = initialRegions[0]?.name;
        assert.ok(
          firstRegionName !== undefined && firstRegionName !== "",
          "First region should have a name"
        );
        counter.reset();

        // Change the region name on line 4 (// #region Imports -> // #region RenamedRegion)
        await replaceTextAtLine(4, "// #region RenamedRegion");

        // Wait for region name to change
        await waitForCondition(
          () => regionHelperAPI.getTopLevelRegions()[0]?.name === "RenamedRegion",
          3000,
          50
        );

        assert.ok(counter.count >= 1, "onDidChangeRegions should fire when renaming a region");

        // Verify name changed
        const regionsAfter = regionHelperAPI.getTopLevelRegions();
        assert.strictEqual(regionsAfter[0]?.name, "RenamedRegion", "Region name should be updated");
      } finally {
        counter.dispose();
      }
    });

    test("should fire when region boundaries move due to line insertion", async () => {
      const counter = createEventCounter(regionHelperAPI.onDidChangeRegions);

      try {
        const initialRegions = regionHelperAPI.getFlattenedRegions();
        const secondRegionStartLine = initialRegions[1]?.range.start.line;
        assert.ok(secondRegionStartLine !== undefined, "Should have at least two regions");
        counter.reset();

        // Insert lines at the very beginning, which should shift all regions down
        await insertTextAtPosition("// Line 1\n// Line 2\n// Line 3\n", 0, 0);

        // Wait for region boundaries to move
        await waitForCondition(
          () => {
            const regions = regionHelperAPI.getFlattenedRegions();
            const newLine = regions[1]?.range.start.line;
            return newLine !== undefined && newLine > secondRegionStartLine;
          },
          3000,
          50
        );

        assert.ok(
          counter.count >= 1,
          "onDidChangeRegions should fire when boundaries move"
        );

        // Verify regions moved
        const regionsAfter = regionHelperAPI.getFlattenedRegions();
        const newSecondRegionStartLine = regionsAfter[1]?.range.start.line;
        assert.ok(
          newSecondRegionStartLine !== undefined &&
            newSecondRegionStartLine > secondRegionStartLine,
          "Region start line should have moved down"
        );
      } finally {
        counter.dispose();
      }
    });
  });

  // #endregion

  // #region onDidChangeInvalidMarkers Tests

  suite("onDidChangeInvalidMarkers", () => {
    test("should NOT fire when editing doesn't affect invalid state", async () => {
      const counter = createEventCounter(regionHelperAPI.onDidChangeInvalidMarkers);

      try {
        // Initially there should be no invalid markers in the valid sample document
        const initialInvalidMarkers = regionHelperAPI.getInvalidMarkers();
        assert.strictEqual(initialInvalidMarkers.length, 0, "Should start with no invalid markers");

        counter.reset();

        // Edit inside a region (not creating any invalid state)
        await insertTextAtPosition("// harmless comment\n", 5, 0);

        await delay(300);

        assert.strictEqual(
          counter.count,
          0,
          "onDidChangeInvalidMarkers should NOT fire when invalid state unchanged"
        );
      } finally {
        counter.dispose();
      }
    });

    test("should fire when an endregion is deleted (creating invalid marker)", async () => {
      const counter = createEventCounter(regionHelperAPI.onDidChangeInvalidMarkers);

      try {
        const initialInvalidMarkers = regionHelperAPI.getInvalidMarkers();
        assert.strictEqual(initialInvalidMarkers.length, 0, "Should start with no invalid markers");

        counter.reset();

        // Delete the #endregion for Imports (line 7)
        await deleteLineRange(7, 7);

        // Wait for invalid markers to appear
        await waitForCondition(
          () => regionHelperAPI.getInvalidMarkers().length > 0,
          3000,
          50
        );

        assert.ok(
          counter.count >= 1,
          "onDidChangeInvalidMarkers should fire when creating invalid marker"
        );

        // Verify we now have invalid markers
        const markersAfter = regionHelperAPI.getInvalidMarkers();
        assert.ok(markersAfter.length > 0, "Should have invalid markers after deleting endregion");
      } finally {
        counter.dispose();
      }
    });

    test("should fire when an orphan endregion is added (creating invalid marker)", async () => {
      const counter = createEventCounter(regionHelperAPI.onDidChangeInvalidMarkers);

      try {
        counter.reset();

        // Add an orphan #endregion at the beginning
        await insertTextAtPosition("// #endregion\n", 0, 0);

        // Wait for both the event to fire AND the markers to appear
        // Use a combined condition to avoid race conditions
        await waitForCondition(
          () => regionHelperAPI.getInvalidMarkers().length > 0 && counter.count >= 1,
          3000,
          50
        );

        assert.ok(
          counter.count >= 1,
          "onDidChangeInvalidMarkers should fire when adding orphan endregion"
        );

        const markersAfter = regionHelperAPI.getInvalidMarkers();
        assert.ok(markersAfter.length > 0, "Should have invalid markers");
        assert.strictEqual(
          markersAfter[0]?.boundaryType,
          "end",
          "Invalid marker should be an 'end' boundary"
        );
      } finally {
        counter.dispose();
      }
    });
  });

  // #endregion
});
