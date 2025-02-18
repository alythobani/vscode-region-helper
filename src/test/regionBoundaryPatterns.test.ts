import * as assert from "assert";

import { getRegionBoundaryPatternsByLanguageId } from "../lib/regionBoundaryPatterns";

suite("Region boundary regex patterns", () => {
  const regionPatterns = getRegionBoundaryPatternsByLanguageId();

  for (const [languageId, patterns] of Object.entries(regionPatterns)) {
    suite(`Region boundary regex patterns: ${languageId}`, () => {
      for (const { startRegex, endRegex } of patterns) {
        test("Start regex should match valid region start", () => {
          const examples = [
            "// #region MyRegion",
            "/* #region AnotherRegion */",
            "# region PythonRegion",
          ];
          for (const example of examples) {
            if (startRegex.test(example)) return; // Pass if any match
          }
          assert.fail(`No matches found for startRegex in ${languageId}`);
        });

        test("End regex should match valid region end", () => {
          const examples = ["// #endregion", "/* #endregion */", "# endregion"];
          for (const example of examples) {
            if (endRegex.test(example)) return; // Pass if any match
          }
          assert.fail(`No matches found for endRegex in ${languageId}`);
        });
      }
    });
  }
});
