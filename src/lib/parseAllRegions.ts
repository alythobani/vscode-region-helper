import type * as vscode from "vscode";
import { type Region } from "../models/Region";
import { getRegionBoundaryPatternsByLanguageId } from "./regionBoundaryPatterns";

type InvalidMarker = {
  errorMsg: string;
  lineIdx: number;
};

type RegionParseResult = {
  topLevelRegions: Region[];
  invalidMarkers: InvalidMarker[];
};

const regionBoundaryPatternsByLanguageId = getRegionBoundaryPatternsByLanguageId();

export function parseAllRegions(document: vscode.TextDocument): RegionParseResult {
  const topLevelRegions: Region[] = [];
  const invalidMarkers: InvalidMarker[] = [];
  const openRegionsStack: Region[] = [];

  const { languageId } = document;
  const regionPatterns = regionBoundaryPatternsByLanguageId[languageId] ?? [];
  if (regionPatterns.length === 0) {
    return { topLevelRegions, invalidMarkers };
  }

  for (let lineIdx = 0; lineIdx < document.lineCount; lineIdx++) {
    const lineText = document.lineAt(lineIdx).text;
    for (const { startRegex, endRegex } of regionPatterns) {
      const startMatch = lineText.match(startRegex);
      if (startMatch) {
        const newRegion = getNewRegionFromStartMatch({ startMatch, startLineIdx: lineIdx });
        openRegionsStack.push(newRegion);
        break; // No need to check other patterns; move to the next line
      }
      const endMatch = lineText.match(endRegex);
      if (!endMatch) {
        continue;
      }
      const lastOpenRegion = openRegionsStack.pop();
      if (!lastOpenRegion) {
        invalidMarkers.push({
          errorMsg: "Region end boundary has no matching start boundary",
          lineIdx,
        });
        break; // Can still treat following regions in editor as valid; move to the next line
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
  }
  for (const openRegion of openRegionsStack) {
    invalidMarkers.push({
      errorMsg: "Region start boundary has no matching end boundary",
      lineIdx: openRegion.startLineIdx,
    });
  }
  return { topLevelRegions, invalidMarkers };
}

function getNewRegionFromStartMatch({
  startMatch,
  startLineIdx,
}: {
  startMatch: RegExpMatchArray;
  startLineIdx: number;
}): Region {
  const name = startMatch[1]?.trim();
  return {
    name,
    startLineIdx,
    endLineIdx: -1,
    children: [],
  };
}
