import type * as vscode from "vscode";
import { type Region } from "../models/Region";
import { getRegionBoundaryPatternMap, type RegexOrArray } from "./regionBoundaryPatterns";

type InvalidMarker = {
  errorMsg: string;
  lineIdx: number;
};

type RegionParseResult = {
  topLevelRegions: Region[];
  invalidMarkers: InvalidMarker[];
};

const regionBoundaryPatternByLanguageId = getRegionBoundaryPatternMap();

export function parseAllRegions(document: vscode.TextDocument): RegionParseResult {
  const topLevelRegions: Region[] = [];
  const invalidMarkers: InvalidMarker[] = [];
  const openRegionsStack: Region[] = [];

  const { languageId } = document;
  const regionBoundaryPattern = regionBoundaryPatternByLanguageId[languageId];
  if (regionBoundaryPattern === undefined) {
    return { topLevelRegions, invalidMarkers };
  }

  const { startRegex, endRegex } = regionBoundaryPattern;
  for (let lineIdx = 0; lineIdx < document.lineCount; lineIdx++) {
    const lineText = document.lineAt(lineIdx).text;
    const startMatch = matchLineWithRegexOrArray(lineText, startRegex);
    if (startMatch) {
      const newRegion = getNewRegionFromStartMatch({ startMatch, startLineIdx: lineIdx });
      openRegionsStack.push(newRegion);
      continue;
    }
    const endMatch = matchLineWithRegexOrArray(lineText, endRegex);
    if (!endMatch) {
      continue; // Not a start or end boundary; move to the next line
    }
    const lastOpenRegion = openRegionsStack.pop();
    if (!lastOpenRegion) {
      const invalidEndMarker: InvalidMarker = {
        errorMsg: "Region end boundary has no matching start boundary",
        lineIdx,
      };
      invalidMarkers.push(invalidEndMarker);
      continue; // Can still treat following regions in editor as valid; move to the next line
    }
    lastOpenRegion.endLineIdx = lineIdx;
    const maybeParentRegion = openRegionsStack[openRegionsStack.length - 1];
    if (maybeParentRegion) {
      lastOpenRegion.parent = maybeParentRegion;
      maybeParentRegion.children.push(lastOpenRegion);
    } else {
      topLevelRegions.push(lastOpenRegion);
    }
  }
  for (const openRegion of openRegionsStack) {
    const invalidStartMarker: InvalidMarker = {
      errorMsg: "Region start boundary has no matching end boundary",
      lineIdx: openRegion.startLineIdx,
    };
    invalidMarkers.push(invalidStartMarker);
  }
  return { topLevelRegions, invalidMarkers };
}

function matchLineWithRegexOrArray(
  lineText: string,
  regexOrArray: RegexOrArray
): RegExpMatchArray | null {
  if (Array.isArray(regexOrArray)) {
    for (const regex of regexOrArray) {
      const match = lineText.match(regex);
      if (match) {
        return match;
      }
    }
    return null;
  }
  return lineText.match(regexOrArray);
}

function getNewRegionFromStartMatch({
  startMatch,
  startLineIdx,
}: {
  startMatch: RegExpMatchArray;
  startLineIdx: number;
}): Region {
  const trimmedName = startMatch[1]?.trim();
  return {
    name: trimmedName === "" ? undefined : trimmedName,
    startLineIdx,
    endLineIdx: -1,
    children: [],
  };
}
