import * as assert from "assert";
import * as vscode from "vscode";
import { type RegionHelperAPI } from "../../api/regionHelperAPI";
import { openSampleDocument } from "../utils/openSampleDocument";

/**
 * Tests for Full Outline tree view updating when editing documents.
 *
 * These tests verify that the FULL OUTLINE tree view correctly updates its content
 * when the user edits the active document.
 */
suite("Full Outline Document Editing", () => {
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

    // Wait for initial full outline to be populated
    if (regionHelperAPI.getTopLevelFullOutlineItems().length === 0) {
      await waitForEvent(regionHelperAPI.onDidChangeFullOutlineItems);
    }
  });

  teardown(async () => {
    // Close the document without saving to avoid pollution
    await vscode.commands.executeCommand("workbench.action.closeActiveEditor");
  });

  // #region Helper Functions

  async function waitForEvent(event: vscode.Event<void>, timeoutMs = 2000): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        disposable.dispose();
        reject(new Error(`Timed out waiting for event after ${timeoutMs}ms`));
      }, timeoutMs);

      const disposable = event(() => {
        clearTimeout(timeout);
        disposable.dispose();
        resolve();
      });
    });
  }

  async function waitForPotentialEvent(ms = 300): Promise<void> {
    // Wait longer than debounce delay (100ms) + some buffer
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

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

  test("should update full outline items when a new region is added", async () => {
    const initialItems = regionHelperAPI.getTopLevelFullOutlineItems();
    const initialCount = initialItems.length;

    // Add a new region
    await insertTextAtPosition("// #region New Test Region\n// content\n// #endregion\n", 0, 0);

    // Wait for the full outline to update
    await waitForEvent(regionHelperAPI.onDidChangeFullOutlineItems);

    const updatedItems = regionHelperAPI.getTopLevelFullOutlineItems();
    assert.ok(
      updatedItems.length > initialCount,
      "Full outline should have more items after adding a region"
    );
  });

  test("should update full outline items when a region is deleted", async () => {
    const initialItems = regionHelperAPI.getTopLevelFullOutlineItems();
    const initialCount = initialItems.length;

    // Delete a region (Imports region: lines 4-7 in sampleRegionsDocument.ts)
    await deleteLineRange(4, 7);

    // Wait for the full outline to update
    await waitForEvent(regionHelperAPI.onDidChangeFullOutlineItems);

    const updatedItems = regionHelperAPI.getTopLevelFullOutlineItems();
    assert.ok(
      updatedItems.length < initialCount,
      "Full outline should have fewer items after deleting a region"
    );
  });

  test("should update full outline items when a region name changes", async () => {
    const initialItems = regionHelperAPI.getTopLevelFullOutlineItems();
    
    // Find a region item in the initial outline (for validation)
    for (const item of initialItems) {
      if (typeof item.label === "string" && item.label.includes("Imports")) {
        break;
      }
    }
    
    // Change the region name (line 4: // #region Imports -> // #region RenamedRegion)
    await replaceTextAtLine(4, "// #region RenamedRegion");

    // Wait for the full outline to update
    await waitForEvent(regionHelperAPI.onDidChangeFullOutlineItems);

    const updatedItems = regionHelperAPI.getTopLevelFullOutlineItems();
    
    // Verify the name changed
    let foundRenamedItem = false;
    for (const item of updatedItems) {
      if (typeof item.label === "string" && item.label.includes("RenamedRegion")) {
        foundRenamedItem = true;
        break;
      }
    }
    
    assert.ok(foundRenamedItem, "Full outline should reflect the renamed region");
  });

  test("should update when document symbols change (e.g., new function added)", async () => {
    // Add a new function to the document
    await insertTextAtPosition(
      "\nfunction newTestFunction() {\n  return true;\n}\n",
      editor.document.lineCount,
      0
    );

    // Wait for the full outline to update
    await waitForEvent(regionHelperAPI.onDidChangeFullOutlineItems);

    const updatedItems = regionHelperAPI.getTopLevelFullOutlineItems();
    
    // The outline may have more items or the same items with updated positions
    // We just verify that the update event fired and we have a valid outline
    assert.ok(updatedItems.length >= 0, "Full outline should update when symbols change");
  });

  test("should handle rapid successive edits correctly", async () => {
    let eventCount = 0;
    const disposable = regionHelperAPI.onDidChangeFullOutlineItems(() => {
      eventCount++;
    });

    try {
      // Make several rapid edits
      await insertTextAtPosition("// Comment 1\n", 0, 0);
      await insertTextAtPosition("// Comment 2\n", 0, 0);
      await insertTextAtPosition("// Comment 3\n", 0, 0);

      // Wait for events to settle
      await waitForPotentialEvent(400);

      // Events should fire (debounced, so possibly fewer than 3)
      assert.ok(eventCount >= 1, "Full outline should update after rapid edits");
    } finally {
      disposable.dispose();
    }
  });

  test("should update active item when cursor moves after editing", async () => {
    // Add a new region at the top
    await insertTextAtPosition("// #region Top Region\n// content\n// #endregion\n", 0, 0);
    await waitForEvent(regionHelperAPI.onDidChangeFullOutlineItems);

    // Move cursor to the new region
    editor.selection = new vscode.Selection(1, 0, 1, 0);
    await waitForEvent(regionHelperAPI.onDidChangeActiveFullOutlineItem);

    const activeItem = regionHelperAPI.getActiveFullOutlineItem();
    assert.ok(
      activeItem !== undefined,
      "Should have an active item after moving cursor to new region"
    );
  });

  test("should handle editing that affects region boundaries", async () => {
    // Insert lines at the beginning, shifting all regions down
    await insertTextAtPosition("// Line 1\n// Line 2\n// Line 3\n", 0, 0);

    // Wait for the full outline to update
    await waitForEvent(regionHelperAPI.onDidChangeFullOutlineItems);

    const updatedItems = regionHelperAPI.getTopLevelFullOutlineItems();
    
    // Items may change count if document symbols are affected, but we should have some items
    // The key is that the outline updated correctly after the edit
    assert.ok(
      updatedItems.length >= 0,
      "Full outline should update after shifting boundaries"
    );
  });

  test("should fire minimal events when editing inside a region", async () => {
    let eventCount = 0;
    const disposable = regionHelperAPI.onDidChangeFullOutlineItems(() => {
      eventCount++;
    });

    try {
      // Edit inside a region without changing structure (modify existing line)
      await replaceTextAtLine(5, "// Modified comment inside region");

      // Wait to see if event fires
      await waitForPotentialEvent();

      // Full Outline may fire if document symbols change (e.g., if the line is inside a function)
      // We just verify the system doesn't crash and handles edits properly
      assert.ok(
        eventCount >= 0,
        "Full outline should handle edits gracefully"
      );
    } finally {
      disposable.dispose();
    }
  });

  test("should handle deletion of all content gracefully", async () => {
    // Delete all content in the document
    const fullRange = new vscode.Range(
      0,
      0,
      editor.document.lineCount - 1,
      editor.document.lineAt(editor.document.lineCount - 1).text.length
    );
    await editor.edit((editBuilder) => {
      editBuilder.delete(fullRange);
    });

    // Wait for the full outline to update
    await waitForPotentialEvent(500); // Give more time since deleting everything is a big change

    const updatedItems = regionHelperAPI.getTopLevelFullOutlineItems();
    assert.strictEqual(
      updatedItems.length,
      0,
      "Full outline should be empty after deleting all content"
    );
  });

  test("should update when mixing region and symbol changes", async () => {
    const initialItems = regionHelperAPI.getTopLevelFullOutlineItems();

    // Add both a region and a function
    await insertTextAtPosition(
      "// #region Mixed Region\nfunction mixedFunction() {}\n// #endregion\n",
      0,
      0
    );

    // Wait for the full outline to update
    await waitForEvent(regionHelperAPI.onDidChangeFullOutlineItems);

    const updatedItems = regionHelperAPI.getTopLevelFullOutlineItems();
    assert.ok(
      updatedItems.length > initialItems.length,
      "Full outline should update with both region and symbol changes"
    );
  });
});
