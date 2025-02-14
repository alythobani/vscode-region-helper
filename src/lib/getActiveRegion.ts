import { type Region } from "../models/Region";

export function getActiveRegion(regions: Region[], cursorLine: number): Region | undefined {
  for (const region of regions) {
    if (cursorLine < region.startLineIdx || cursorLine > region.endLineIdx) {
      continue;
    }
    return getActiveRegion(region.children, cursorLine) ?? region;
  }
  return undefined;
}
