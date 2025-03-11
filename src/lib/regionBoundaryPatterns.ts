import { getRegionHelperConfig } from "../config/regionHelperConfig";

type LanguageId = string;

export type RegexOrArray = RegExp | RegExp[];

type RegionBoundaryPattern = {
  /** The regular expression that matches the start of a region. Should ideally capture the name of the region. */
  startRegex: RegexOrArray;
  /** The regular expression that matches the end of a region. */
  endRegex: RegexOrArray;
};
type RegionBoundaryPatternMap = Record<LanguageId, RegionBoundaryPattern>;

type RegexStringOrArray = string | string[];

type RawRegionBoundaryPattern = {
  startRegex: RegexStringOrArray;
  endRegex: RegexStringOrArray;
};
type RegionBoundaryPatternsConfig = Record<LanguageId, RawRegionBoundaryPattern>;

export function getRegionBoundaryPatternMap(): RegionBoundaryPatternMap {
  const rawBoundaryPatternByLanguageId = getRegionBoundaryPatternsConfig();
  return parseLanguagePatternsConfig(rawBoundaryPatternByLanguageId);
}

function getRegionBoundaryPatternsConfig(): RegionBoundaryPatternsConfig {
  const config = getRegionHelperConfig();
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
      startRegex: parseRegexOrArray(rawPattern.startRegex),
      endRegex: parseRegexOrArray(rawPattern.endRegex),
    };
  } catch (e) {
    console.error(`Failed to parse region boundary pattern for language '${languageId}'`, e);
    return undefined;
  }
}

function parseRegexOrArray(input: RegexStringOrArray): RegexOrArray {
  if (Array.isArray(input)) {
    return input.map((s) => new RegExp(s));
  } else {
    return new RegExp(input);
  }
}
