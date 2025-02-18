import { type Region } from "../models/Region";

export function getCursorActiveRegion(regions: Region[], cursorLine: number): Region | undefined {
  for (const region of regions) {
    if (cursorLine < region.startLineIdx || cursorLine > region.endLineIdx) {
      continue;
    }
    return getCursorActiveRegion(region.children, cursorLine) ?? region;
  }
  return undefined;
}
