import * as assert from "assert";
import { readdirSync } from "fs";
import * as path from "path";

import { parseAllRegions } from "../lib/parseAllRegions";
import { assertExists } from "../utils/assertUtils";
import {
  createTestInvalidSampleDocument,
  createTestSampleDocument,
} from "./utils/createTestSampleDocument";

suite("Parse files with only valid regions", () => {
  const sampleDir = path.join(__dirname, "validSamples");
  const sampleFileNames = readdirSync(sampleDir);

  for (const sampleFileName of sampleFileNames) {
    test(`Parse regions in ${sampleFileName}`, async () => {
      const sampleDocument = await createTestSampleDocument(sampleFileName);
      const result = parseAllRegions(sampleDocument);

      const { topLevelRegions, invalidMarkers } = result;

      assert.strictEqual(topLevelRegions.length, 2, "Expected 2 top-level regions");
      const [firstRegion, secondRegion] = topLevelRegions;
      assertExists(firstRegion);
      assertExists(secondRegion);
      assert.strictEqual(firstRegion.name, "FirstRegion");
      assert.strictEqual(firstRegion.regionIdx, 0);
      assert.strictEqual(secondRegion.name, "Second Region");
      assert.strictEqual(secondRegion.regionIdx, 1);

      assert.strictEqual(secondRegion.children.length, 2, "Expected 2 nested regions");
      const [subregion1, subregion2] = secondRegion.children;
      assertExists(subregion1);
      assertExists(subregion2);
      assert.strictEqual(subregion1.name, "InnerRegion");
      assert.strictEqual(subregion1.regionIdx, 0);
      assert.strictEqual(subregion2.name, undefined);
      assert.strictEqual(subregion2.regionIdx, 1);

      assert.strictEqual(invalidMarkers.length, 0, "Expected 0 invalid markers");
    });
  }
});

suite("Parse all regions with invalid markers", () => {
  const invalidSampleDir = path.join(__dirname, "invalidSamples");
  const invalidSampleFileNames = readdirSync(invalidSampleDir);

  for (const invalidSampleFileName of invalidSampleFileNames) {
    test(`Parse valid and invalid regions in ${invalidSampleFileName}`, async () => {
      const invalidSampleDocument = await createTestInvalidSampleDocument(invalidSampleFileName);

      const { topLevelRegions, invalidMarkers } = parseAllRegions(invalidSampleDocument);

      assert.strictEqual(topLevelRegions.length, 2, "Expected 2 top-level regions");
      const [firstRegion, secondRegion] = topLevelRegions;
      assertExists(firstRegion);
      assertExists(secondRegion);
      assert.strictEqual(firstRegion.name, "FirstRegion");
      assert.strictEqual(firstRegion.regionIdx, 0);
      assert.strictEqual(secondRegion.name, "Second Region");
      assert.strictEqual(secondRegion.regionIdx, 1);

      assert.strictEqual(secondRegion.children.length, 2, "Expected 2 nested regions");
      const [subregion1, subregion2] = secondRegion.children;
      assertExists(subregion1);
      assertExists(subregion2);
      assert.strictEqual(subregion1.name, "InnerRegion");
      assert.strictEqual(subregion1.regionIdx, 0);
      assert.strictEqual(subregion2.name, undefined);
      assert.strictEqual(subregion2.regionIdx, 1);

      assert.strictEqual(invalidMarkers.length, 2, "Expected 2 invalid markers");
      const [invalidEndMarker, invalidStartMarker] = invalidMarkers;
      assertExists(invalidEndMarker);
      assertExists(invalidStartMarker);
      assert.strictEqual(invalidEndMarker.markerType, "end");
      assert.strictEqual(invalidStartMarker.markerType, "start");
    });
  }
});
