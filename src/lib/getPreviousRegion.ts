import { type Region } from "../models/Region";
import { type RegionStore } from "../state/RegionStore";

/**
 * Returns the previous region before the cursor, circling back to the last region if necessary.
 */
export function getPreviousRegion(
  flattenedRegions: RegionStore["flattenedRegions"],
  cursorLineIdx: number
): Region | undefined {
  for (let i = flattenedRegions.length - 1; i >= 0; i--) {
    const region = flattenedRegions[i];
    if (region && region.startLineIdx < cursorLineIdx) {
      return region;
    }
  }
  return flattenedRegions[flattenedRegions.length - 1];
}
