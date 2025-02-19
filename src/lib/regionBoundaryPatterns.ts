import * as vscode from "vscode";

type LanguageId = string;

type RegionBoundaryPattern = {
  /** The regular expression that matches the start of a region. Should ideally capture the name of the region. */
  startRegex: RegExp;
  /** The regular expression that matches the end of a region. */
  endRegex: RegExp;
};
type RegionBoundaryPatternMap = Record<LanguageId, RegionBoundaryPattern>;

type RawRegionBoundaryPattern = {
  startRegex: string;
  endRegex: string;
};
type RegionBoundaryPatternsConfig = Record<LanguageId, RawRegionBoundaryPattern>;

export function getRegionBoundaryPatternMap(): RegionBoundaryPatternMap {
  const rawBoundaryPatternByLanguageId = getRegionBoundaryPatternsConfig();
  return parseLanguagePatternsConfig(rawBoundaryPatternByLanguageId);
}

function getRegionBoundaryPatternsConfig(): RegionBoundaryPatternsConfig {
  const config = vscode.workspace.getConfiguration("region-helper");
  return config.get("regionBoundaryPatternByLanguageId", {});
}

function parseLanguagePatternsConfig(
  rawBoundaryPatternByLanguageId: RegionBoundaryPatternsConfig
): RegionBoundaryPatternMap {
  const parsedPatternByLanguageId: RegionBoundaryPatternMap = {};
  for (const [languageId, pattern] of Object.entries(rawBoundaryPatternByLanguageId)) {
    const parsedPattern = parseRegionBoundaryPattern(pattern, languageId);
    if (!parsedPattern) {
      continue;
    }
    parsedPatternByLanguageId[languageId] = parsedPattern;
  }
  return parsedPatternByLanguageId;
}

function parseRegionBoundaryPattern(
  rawPattern: RawRegionBoundaryPattern,
  languageId: string
): RegionBoundaryPattern | undefined {
  try {
    return {
      startRegex: new RegExp(rawPattern.startRegex),
      endRegex: new RegExp(rawPattern.endRegex),
    };
  } catch (e) {
    console.error(`Failed to parse region boundary pattern for language '${languageId}'`, e);
    return undefined;
  }
}
