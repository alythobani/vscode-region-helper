import { type Region } from "../models/Region";

/**
 * Returns the next region after the cursor, circling back to the first region if necessary.
 */
export function getNextRegion(
  flattenedRegions: Region[],
  cursorLineIdx: number
): Region | undefined {
  for (const region of flattenedRegions) {
    if (region.range.start.line > cursorLineIdx) {
      return region;
    }
  }
  return flattenedRegions[0];
}
