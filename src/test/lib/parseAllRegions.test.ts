import * as assert from "assert";

import { parseAllRegions } from "../../lib/parseAllRegions";
import { assertExists } from "../../utils/assertUtils";
import {
  getAllFileNamesInSampleFolder,
  openInvalidSampleDocument,
  openValidSampleDocument,
} from "../utils/openSampleDocument";

suite("Parse files with only valid regions", () => {
  const validSamplesFolderName = "validSamples";
  const sampleFileNames = getAllFileNamesInSampleFolder(validSamplesFolderName);

  for (const sampleFileName of sampleFileNames) {
    test(`Parse regions in ${sampleFileName}`, async () => {
      const sampleDocument = await openValidSampleDocument(sampleFileName);

      const { topLevelRegions, invalidMarkers } = parseAllRegions(sampleDocument);

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
  const invalidSamplesFolderName = "invalidSamples";
  const invalidSampleFileNames = getAllFileNamesInSampleFolder(invalidSamplesFolderName);

  for (const invalidSampleFileName of invalidSampleFileNames) {
    test(`Parse valid and invalid regions in ${invalidSampleFileName}`, async () => {
      const invalidSampleDocument = await openInvalidSampleDocument(invalidSampleFileName);

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
      assert.strictEqual(invalidEndMarker.boundaryType, "end");
      assert.strictEqual(invalidStartMarker.boundaryType, "start");
    });
  }
});
