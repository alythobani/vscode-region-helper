import * as vscode from "vscode";

type RegionBoundaryPattern = {
  /** The regular expression that matches the start of a region. Should capture the name of the region. */
  startRegex: RegExp;
  /** The regular expression that matches the end of a region. */
  endRegex: RegExp;
};

type LanguageId = string;

type BoundaryPatternConfig = {
  startRegex: string;
  endRegex: string;
};

export function getRegionBoundaryPatternsByLanguageId(): Record<
  LanguageId,
  RegionBoundaryPattern[]
> {
  const config = vscode.workspace.getConfiguration("region-helper");
  const rawPatterns = config.get<Record<string, BoundaryPatternConfig[]>>(
    "regionBoundaryPatterns",
    {}
  );
  return parseRegionBoundaryPatterns(rawPatterns);
}

function parseRegionBoundaryPatterns(
  rawPatterns: Record<LanguageId, BoundaryPatternConfig[]>
): Record<string, RegionBoundaryPattern[]> {
  const parsedPatterns: Record<LanguageId, RegionBoundaryPattern[]> = {};

  for (const [languageId, languagePatterns] of Object.entries(rawPatterns)) {
    parsedPatterns[languageId] = [];
    for (const pattern of languagePatterns) {
      const parsedPattern = parseRegionBoundaryPattern(pattern, languageId);
      if (!parsedPattern) {
        continue;
      }
      parsedPatterns[languageId].push(parsedPattern);
    }
  }

  return parsedPatterns;
}

function parseRegionBoundaryPattern(
  rawPattern: BoundaryPatternConfig,
  languageId: string
): RegionBoundaryPattern | undefined {
  try {
    return {
      startRegex: new RegExp(rawPattern.startRegex),
      endRegex: new RegExp(rawPattern.endRegex),
    };
  } catch (e) {
    console.error(`Failed to parse region boundary pattern for language "${languageId}"`, e);
    return undefined;
  }
}
