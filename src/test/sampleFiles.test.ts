import * as assert from "assert";
import { promises as fs } from "fs";
import * as path from "path";

import { getRegionBoundaryPatternMap } from "../lib/regionBoundaryPatterns";
import {
  createTestInvalidSampleDocument,
  createTestSampleDocument,
} from "./utils/createTestSampleDocument";

const regionBoundaryPatternByLanguageId = getRegionBoundaryPatternMap();

suite("Every config default language has an associated valid sample file", () => {
  const sampleFileLanguageIds = new Set<string>();
  suiteSetup(async () => {
    const sampleDir = path.join(__dirname, "validSamples");
    const sampleFileNames = await fs.readdir(sampleDir);
    const sampleDocuments = await Promise.all(sampleFileNames.map(createTestSampleDocument));
    sampleDocuments.forEach((doc) => sampleFileLanguageIds.add(doc.languageId));
  });

  for (const languageId of Object.keys(regionBoundaryPatternByLanguageId)) {
    test(`Sample file exists for ${languageId}`, () => {
      assert.ok(sampleFileLanguageIds.has(languageId));
    });
  }
});

suite("Every valid sample file has an associated invalid sample file", () => {
  const invalidSampleFileLanguageIds = new Set<string>();
  suiteSetup(async () => {
    const invalidSampleDir = path.join(__dirname, "invalidSamples");
    const invalidSampleFileNames = await fs.readdir(invalidSampleDir);
    const invalidSampleDocuments = await Promise.all(
      invalidSampleFileNames.map(createTestInvalidSampleDocument)
    );
    invalidSampleDocuments.forEach((doc) => invalidSampleFileLanguageIds.add(doc.languageId));
  });

  for (const languageId of Object.keys(regionBoundaryPatternByLanguageId)) {
    test(`Invalid sample file exists for ${languageId}`, () => {
      assert.ok(invalidSampleFileLanguageIds.has(languageId));
    });
  }
});
