import * as assert from "assert";
import * as vscode from "vscode";
import { type RegionHelperAPI } from "../../api/regionHelperAPI";
import { getPreviousRegion } from "../../lib/getPreviousRegion";
import { type Region } from "../../models/Region";
import { assertExists } from "../../utils/assertUtils";
import { openSampleDocument } from "../utils/openSampleDocument";

type RegionNameAndLine = {
  name: string | undefined;
  lineIdx: number;
};

/** Should match the regions in sampleRegionsDocument.ts */
const importsRegion = { name: "Imports", lineIdx: 4 };
const classesRegion = { name: "Classes", lineIdx: 9 };
const constructorRegion = { name: "Constructor", lineIdx: 15 };
const methodsRegion = { name: "Methods", lineIdx: 22 };
const nestedMethodRegion = { name: "Nested Method Region", lineIdx: 31 };
const siblingClassesRegion = { name: "Sibling Classes", lineIdx: 39 };
const anotherNestedRegion = { name: "Another Nested Region", lineIdx: 48 };
const typeDefinitionsRegion = { name: "Type Definitions", lineIdx: 60 };
const unnamedRegion = { name: undefined, lineIdx: 64 };
const sampleRegions: RegionNameAndLine[] = [
  importsRegion,
  classesRegion,
  constructorRegion,
  methodsRegion,
  nestedMethodRegion,
  siblingClassesRegion,
  anotherNestedRegion,
  typeDefinitionsRegion,
  unnamedRegion,
];

suite("getPreviousRegion", () => {
  let regionHelperAPI: RegionHelperAPI;
  let mockCursorLineIdx = 0;
  let sampleDocument: vscode.TextDocument;

  suiteSetup(async () => {
    const regionHelperExtension = vscode.extensions.getExtension("alythobani.region-helper");
    if (!regionHelperExtension) {
      throw new Error("Region Helper extension not found!");
    }
    await regionHelperExtension.activate();
    regionHelperAPI = regionHelperExtension.exports as RegionHelperAPI;

    sampleDocument = await openSampleDocument("sampleRegionsDocument.ts");
  });

  setup(async () => {
    // Ensure the sample document is active before each test
    await vscode.window.showTextDocument(sampleDocument);
    // Wait for regions to be parsed
    await new Promise<void>((resolve) => setTimeout(resolve, 200));
    if (regionHelperAPI.getTopLevelRegions().length === 0) {
      await new Promise<void>((resolve) => {
        const disposable = regionHelperAPI.onDidChangeRegions(() => {
          disposable.dispose();
          resolve();
        });
      });
    }
  });

  async function openAndShowSampleDocument(sampleFileName: string): Promise<void> {
    const sampleDocument = await openSampleDocument(sampleFileName);
    await vscode.window.showTextDocument(sampleDocument);
  }

  function _getPreviousRegion(): Region | undefined {
    const flattenedRegions = regionHelperAPI.getFlattenedRegions();
    return getPreviousRegion(flattenedRegions, mockCursorLineIdx);
  }

  function assertPreviousRegion(expectedRegionIdx: number): void {
    const previousRegion = _getPreviousRegion();
    assert.notStrictEqual(previousRegion, undefined);
    assertExists(previousRegion); // Let TS know that previousRegion is not undefined
    const expectedRegion = sampleRegions[expectedRegionIdx];
    assertExists(expectedRegion);
    assert.strictEqual(previousRegion.name, expectedRegion.name);
    assert.strictEqual(previousRegion.range.start.line, expectedRegion.lineIdx);
  }

  function setCursorLine(lineIdx: number): void {
    mockCursorLineIdx = lineIdx;
  }

  function moveCursorToRegion(regionIdx: number): void {
    const sampleRegion = sampleRegions[regionIdx];
    assertExists(sampleRegion);
    setCursorLine(sampleRegion.lineIdx);
  }

  test("Moves from any region's start line to the previous", () => {
    for (let i = 1; i < sampleRegions.length; i++) {
      moveCursorToRegion(i);
      assertPreviousRegion(i - 1);
    }
  });

  test("Moves from the first region to the last region", () => {
    moveCursorToRegion(0);
    assertPreviousRegion(8);
  });

  test("Moves from before all regions to the last region", () => {
    setCursorLine(0);
    assertPreviousRegion(8);
  });

  test("Moves from within any region to its start line", () => {
    for (let i = 0; i < sampleRegions.length; i++) {
      const sampleRegion = sampleRegions[i];
      assertExists(sampleRegion);
      setCursorLine(sampleRegion.lineIdx + 1);
      assertPreviousRegion(i);
    }
  });

  test("No previous region if document is empty", async () => {
    await openAndShowSampleDocument("emptyDocument.ts");
    await new Promise<void>((resolve) => {
      const disposable = regionHelperAPI.onDidChangeRegions(() => {
        disposable.dispose();
        resolve();
      });
    });
    const previousRegion = _getPreviousRegion();
    assert.strictEqual(previousRegion, undefined);
  });
});
