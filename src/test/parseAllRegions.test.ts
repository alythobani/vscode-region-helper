import * as assert from "assert";
import { readdirSync } from "fs";
import * as path from "path";

import { parseAllRegions } from "../lib/parseAllRegions";
import { assertExists } from "../utils/assertUtils";
import { createTestSampleDocument } from "./utils/createTestSampleDocument";

suite("Parse all regions", () => {
  const sampleDir = path.join(__dirname, "samples");
  const sampleFileNames = readdirSync(sampleDir);

  for (const sampleFileName of sampleFileNames) {
    test(`Parse regions in ${sampleFileName}`, async () => {
      const sampleDocument = await createTestSampleDocument(sampleFileName);
      const result = parseAllRegions(sampleDocument);
      const { topLevelRegions } = result;
      assert.strictEqual(topLevelRegions.length, 2, "Expected 2 top-level regions");
      const [firstRegion, secondRegion] = topLevelRegions;
      assertExists(firstRegion);
      assertExists(secondRegion);
      assert.strictEqual(firstRegion.name, "FirstRegion");
      assert.strictEqual(secondRegion.name, "SecondRegion");
      assert.strictEqual(secondRegion.children.length, 2, "Expected 2 nested regions");
      const [subregion1, subregion2] = secondRegion.children;
      assertExists(subregion1);
      assertExists(subregion2);
      assert.strictEqual(subregion1.name, "InnerRegion");
      assert.strictEqual(subregion2.name, undefined);
    });
  }
});
