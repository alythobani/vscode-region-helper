import * as assert from "assert";
import { promises as fs } from "fs";
import * as path from "path";

import { getRegionBoundaryPatternMap } from "../lib/regionBoundaryPatterns";
import { createTestSampleDocument } from "./utils/createTestSampleDocument";

const regionBoundaryPatternByLanguageId = getRegionBoundaryPatternMap();

suite("Every config default language has an associated test sample file", () => {
  let sampleFileLanguageIds: string[] = [];
  suiteSetup(async () => {
    const sampleDir = path.join(__dirname, "samples");
    const sampleFileNames = await fs.readdir(sampleDir);
    const sampleDocuments = await Promise.all(sampleFileNames.map(createTestSampleDocument));
    sampleFileLanguageIds = sampleDocuments.map((doc) => doc.languageId);
  });

  for (const languageId of Object.keys(regionBoundaryPatternByLanguageId)) {
    test(`Sample file exists for ${languageId}`, () => {
      assert.ok(sampleFileLanguageIds.includes(languageId));
    });
  }
});
