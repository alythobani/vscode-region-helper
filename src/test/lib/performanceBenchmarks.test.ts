/**
 * Benchmark tests for Region Helper extension performance.
 *
 * This file tests:
 * 1. Region parsing performance across different file sizes
 * 2. Event firing precision (ratio of events fired to edits made)
 *
 * Run with: npm run test (when vscode test environment is available)
 */

import * as assert from "assert";
import * as vscode from "vscode";
import { type RegionHelperAPI } from "../../api/regionHelperAPI";
import { flattenRegionsAndCountParents } from "../../lib/flattenRegions";
import { parseAllRegions } from "../../lib/parseAllRegions";
import { generateLargeTestFile, printEventCountResults, type EventCountResult } from "../utils/benchmarkUtils";

/**
 * Helper to wait for a short duration (for debounced operations to settle).
 */
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

suite("Performance Benchmarks", () => {
  const timeout = 60000; // 60 second timeout for performance tests
  let regionHelperAPI: RegionHelperAPI;

  // Ensure extension is activated before tests
  suiteSetup(async () => {
    const ext = vscode.extensions.getExtension("alythobani.region-helper");
    if (!ext) {
      throw new Error("Region Helper extension not found!");
    }
    await ext.activate();
    regionHelperAPI = ext.exports as RegionHelperAPI;
  });

  /**
   * Test region parsing performance with different file sizes.
   * This directly measures parseAllRegions() performance.
   */
  test("Region parsing performance - various file sizes", async function () {
    this.timeout(timeout);

    const sizes = [
      { lines: 100, regions: 5, name: "Small (100 lines)" },
      { lines: 500, regions: 25, name: "Medium (500 lines)" },
      { lines: 1000, regions: 50, name: "Large (1000 lines)" },
      { lines: 2000, regions: 100, name: "XLarge (2000 lines)" },
    ];

    console.log("\n=== Region Parsing Performance ===\n");
    console.log("| File Size | Regions | Parse Time (avg) | Flatten Time (avg) |");
    console.log("|-----------|---------|------------------|-------------------|");

    for (const size of sizes) {
      const content = generateLargeTestFile(size.lines, size.regions);
      const doc = await vscode.workspace.openTextDocument({
        content,
        language: "typescript",
      });

      const parseTimes: number[] = [];
      const flattenTimes: number[] = [];

      // Measure parsing time
      for (let i = 0; i < 10; i++) {
        const parseStart = performance.now();
        const { topLevelRegions } = parseAllRegions(doc);
        const parseEnd = performance.now();
        parseTimes.push(parseEnd - parseStart);

        const flattenStart = performance.now();
        flattenRegionsAndCountParents(topLevelRegions);
        const flattenEnd = performance.now();
        flattenTimes.push(flattenEnd - flattenStart);
      }

      const avgParseTime = parseTimes.reduce((a, b) => a + b, 0) / parseTimes.length;
      const avgFlattenTime = flattenTimes.reduce((a, b) => a + b, 0) / flattenTimes.length;
      console.log(
        `| ${size.name} | ${size.regions} | ${avgParseTime.toFixed(2)}ms | ${avgFlattenTime.toFixed(2)}ms |`
      );

      // Basic assertion - parsing should complete in reasonable time
      assert.ok(avgParseTime < 5000, `Parsing took too long for ${size.name}: ${avgParseTime}ms`);
    }
  });

  /**
   * Test event firing precision - how many events fire vs edits made.
   * This tests the optimized event firing in RegionStore.
   */
  test("Event firing precision - identical content edits", async function () {
    this.timeout(timeout);

    const content = `
// #region TestRegion1
const x = 1;
// #endregion

// #region TestRegion2
const y = 2;
// #endregion
`;

    // Create a document and open it in an editor to trigger RegionStore updates
    const doc = await vscode.workspace.openTextDocument({
      content,
      language: "typescript",
    });
    const editor = await vscode.window.showTextDocument(doc);

    // Wait for initial parse
    await wait(200);

    // Count region change events using extension API
    let regionEventCount = 0;
    const regionDisposable = regionHelperAPI.onDidChangeRegions(() => {
      regionEventCount++;
    });

    // Count invalid marker events using extension API
    let invalidMarkerEventCount = 0;
    const invalidDisposable = regionHelperAPI.onDidChangeInvalidMarkers(() => {
      invalidMarkerEventCount++;
    });

    const editCount = 10;

    try {
      // Make edits that don't change regions (add/remove whitespace in non-region areas)
      for (let i = 0; i < editCount; i++) {
        // Add a space at the end of a non-region line
        await editor.edit((editBuilder) => {
          editBuilder.insert(new vscode.Position(2, 14), " ");
        });
        await wait(150); // Wait for debounced refresh

        // Remove the space
        await editor.edit((editBuilder) => {
          editBuilder.delete(new vscode.Range(new vscode.Position(2, 14), new vscode.Position(2, 15)));
        });
        await wait(150); // Wait for debounced refresh
      }

      console.log(`\nAfter ${editCount * 2} non-region-affecting edits:`);
      console.log(`  Region events fired: ${regionEventCount}`);
      console.log(`  Invalid marker events fired: ${invalidMarkerEventCount}`);

      const results: EventCountResult[] = [
        {
          eventName: "onDidChangeRegions",
          editCount: editCount * 2,
          eventsFired: regionEventCount,
          ratio: regionEventCount / (editCount * 2),
        },
        {
          eventName: "onDidChangeInvalidMarkers",
          editCount: editCount * 2,
          eventsFired: invalidMarkerEventCount,
          ratio: invalidMarkerEventCount / (editCount * 2),
        },
      ];

      printEventCountResults(results);

      // With precision event firing, minimal events should fire for non-region edits
      // Note: Some events may fire during initial stabilization, so we check for low ratio
      const regionRatio = regionEventCount / (editCount * 2);
      assert.ok(
        regionRatio <= 0.5,
        `Expected low region event ratio for non-region edits, got ${(regionRatio * 100).toFixed(1)}%`
      );
    } finally {
      regionDisposable.dispose();
      invalidDisposable.dispose();
      await vscode.commands.executeCommand("workbench.action.closeActiveEditor");
    }
  });

  /**
   * Test that events DO fire when regions actually change.
   */
  test("Event firing - actual region changes", async function () {
    this.timeout(timeout);

    const initialContent = `// #region A\nconst a = 1;\n// #endregion`;

    const doc = await vscode.workspace.openTextDocument({
      content: initialContent,
      language: "typescript",
    });
    const editor = await vscode.window.showTextDocument(doc);

    // Wait for initial parse
    await wait(200);

    let regionEventCount = 0;
    const regionDisposable = regionHelperAPI.onDidChangeRegions(() => {
      regionEventCount++;
    });

    try {
      // Add a new region - this SHOULD trigger an event
      await editor.edit((editBuilder) => {
        editBuilder.insert(
          new vscode.Position(3, 0),
          "\n// #region B\nconst b = 2;\n// #endregion"
        );
      });

      await wait(200); // Wait for debounced refresh

      console.log(`\nAfter adding a new region:`);
      console.log(`  Region events fired: ${regionEventCount}`);

      // Events SHOULD fire when regions change
      assert.ok(
        regionEventCount > 0,
        `Expected events to fire for region changes, got ${regionEventCount}`
      );
    } finally {
      regionDisposable.dispose();
      await vscode.commands.executeCommand("workbench.action.closeActiveEditor");
    }
  });

  /**
   * Stress test - many rapid edits to the same document.
   */
  test("Stress test - rapid sequential edits", async function () {
    this.timeout(timeout);

    const initialContent = `// #region Stress\nconst x = 0;\n// #endregion`;

    const doc = await vscode.workspace.openTextDocument({
      content: initialContent,
      language: "typescript",
    });
    const editor = await vscode.window.showTextDocument(doc);

    // Wait for initial parse
    await wait(200);

    let eventCount = 0;
    const disposable = regionHelperAPI.onDidChangeRegions(() => {
      eventCount++;
    });

    try {
      const editCount = 20;
      const startTime = performance.now();

      for (let i = 0; i < editCount; i++) {
        // Change a value inside the region
        await editor.edit((editBuilder) => {
          editBuilder.replace(
            new vscode.Range(new vscode.Position(1, 12), new vscode.Position(1, 13)),
            String(i % 10)
          );
        });
        // Small wait to allow processing
        await wait(20);
      }

      // Wait for final debounced updates
      await wait(200);

      const totalTime = performance.now() - startTime;

      console.log(`\n=== Stress Test Results ===`);
      console.log(`  Total edits: ${editCount}`);
      console.log(`  Total time: ${totalTime.toFixed(2)}ms`);
      console.log(`  Avg time per edit: ${(totalTime / editCount).toFixed(2)}ms`);
      console.log(`  Events fired: ${eventCount}`);
      console.log(`  Event ratio: ${((eventCount / editCount) * 100).toFixed(1)}%`);

      // Should complete in reasonable time
      assert.ok(totalTime < 30000, `Stress test took too long: ${totalTime}ms`);
    } finally {
      disposable.dispose();
      await vscode.commands.executeCommand("workbench.action.closeActiveEditor");
    }
  });
});
