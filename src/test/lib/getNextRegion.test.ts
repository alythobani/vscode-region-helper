import * as assert from "assert";
import * as vscode from "vscode";
import { type RegionHelperAPI } from "../../extension";
import { getNextRegion } from "../../lib/getNextRegion";
import { type Region } from "../../models/Region";
import { assertExists } from "../../utils/assertUtils";
import { openSampleDocument } from "../utils/openSampleDocument";

suite("getNextRegion", () => {
  let regionHelperAPI: RegionHelperAPI;
  let mockCursorLineIdx = 0;

  suiteSetup(async () => {
    const regionHelperExtension = vscode.extensions.getExtension("alythobani.region-helper");
    if (!regionHelperExtension) {
      throw new Error("Region Helper extension not found!");
    }
    await regionHelperExtension.activate();
    regionHelperAPI = regionHelperExtension.exports as RegionHelperAPI;

    await openAndShowSampleDocument("sampleRegionsDocument.ts");
  });

  async function openAndShowSampleDocument(sampleFileName: string): Promise<void> {
    const sampleDocument = await openSampleDocument(sampleFileName);
    await vscode.window.showTextDocument(sampleDocument);
  }

  function _getNextRegion(): Region | undefined {
    const flattenedRegions = regionHelperAPI.getFlattenedRegions();
    return getNextRegion(flattenedRegions, mockCursorLineIdx);
  }

  function assertNextRegionNameAndLine(
    expectedRegionName: string | undefined,
    expectedLineIdx: number
  ): void {
    const nextRegion = _getNextRegion();
    assert.notStrictEqual(nextRegion, undefined);
    assertExists(nextRegion); // Let TS know that nextRegion is not undefined
    assert.strictEqual(nextRegion.name, expectedRegionName);
    assert.strictEqual(nextRegion.startLineIdx, expectedLineIdx);
  }

  function setCursorLine(lineIdx: number): void {
    mockCursorLineIdx = lineIdx;
  }

  test("Moves to first region (Imports) when before all regions", () => {
    assertNextRegionNameAndLine("Imports", 4);
  });

  test("Moves from Imports to Classes", () => {
    setCursorLine(4);
    assertNextRegionNameAndLine("Classes", 9);
    setCursorLine(5);
    assertNextRegionNameAndLine("Classes", 9);
  });

  test("Moves from Classes to Classes -> Constructor", () => {
    setCursorLine(9);
    assertNextRegionNameAndLine("Constructor", 15);
    setCursorLine(10);
    assertNextRegionNameAndLine("Constructor", 15);
  });

  test("Moves from Classes -> Constructor to Classes -> Methods", () => {
    setCursorLine(15);
    assertNextRegionNameAndLine("Methods", 22);
    setCursorLine(16);
    assertNextRegionNameAndLine("Methods", 22);
  });

  test("Moves from middle of Classes to Classes -> Methods", () => {
    setCursorLine(21);
    assertNextRegionNameAndLine("Methods", 22);
  });

  test("Moves from Classes -> Methods to Classes -> Methods -> Nested Method Region", () => {
    setCursorLine(22);
    assertNextRegionNameAndLine("Nested Method Region", 31);
  });

  test("Moves from Classes -> Methods -> Nested Method Region to Classes -> Sibling Classes", () => {
    setCursorLine(31);
    assertNextRegionNameAndLine("Sibling Classes", 39);
  });

  test("Moves from Classes -> Sibling Classes to Classes -> Sibling Classes -> Another Nested Region", () => {
    setCursorLine(39);
    assertNextRegionNameAndLine("Another Nested Region", 48);
  });

  test("Moves from Classes -> Sibling Classes -> Another Nested Region to Type Definitions", () => {
    setCursorLine(48);
    assertNextRegionNameAndLine("Type Definitions", 60);
  });

  test("Moves from Type Definitions to unnamed region", () => {
    setCursorLine(60);
    assertNextRegionNameAndLine(undefined, 64);
  });

  test("Loop back to first region after last region", () => {
    setCursorLine(64);
    assertNextRegionNameAndLine("Imports", 4);
    setCursorLine(68);
    assertNextRegionNameAndLine("Imports", 4);
  });

  test("No next region if document is empty", async () => {
    await openAndShowSampleDocument("emptyDocument.ts");
    const nextRegion = _getNextRegion();
    assert.strictEqual(nextRegion, undefined);
  });
});
