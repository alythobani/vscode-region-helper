import * as assert from "assert";

import { getRegionBoundaryPatternMap } from "../lib/regionBoundaryPatterns";
import { openAllFilesInSampleFolder } from "./utils/openSampleDocument";

const regionBoundaryPatternByLanguageId = getRegionBoundaryPatternMap();

suite("Every config default language has an associated valid sample file", function () {
  this.timeout(30000); // Opening 50+ files can take time

  const sampleFileLanguageIds = new Set<string>();
  suiteSetup(async () => {
    const sampleDocuments = await openAllFilesInSampleFolder("validSamples");
    sampleDocuments.forEach((doc) => sampleFileLanguageIds.add(doc.languageId));
  });

  for (const languageId of Object.keys(regionBoundaryPatternByLanguageId)) {
    test(`Sample file exists for ${languageId}`, () => {
      assert.ok(sampleFileLanguageIds.has(languageId));
    });
  }
});

suite("Every valid sample file has an associated invalid sample file", function () {
  this.timeout(30000); // Opening 50+ files can take time

  const invalidSampleFileLanguageIds = new Set<string>();
  suiteSetup(async () => {
    const invalidSampleDocuments = await openAllFilesInSampleFolder("invalidSamples");
    invalidSampleDocuments.forEach((doc) => invalidSampleFileLanguageIds.add(doc.languageId));
  });

  for (const languageId of Object.keys(regionBoundaryPatternByLanguageId)) {
    test(`Invalid sample file exists for ${languageId}`, () => {
      assert.ok(invalidSampleFileLanguageIds.has(languageId));
    });
  }
});
