import { type Region } from "../models/Region";

export type FlattenedRegion = Region & {
  flatRegionIdx: number;
};

/**
 * Flattens a tree of regions, with a `flatRegionIdx` field on each resulting flattened item.
 *
 * Note: This function takes O(numRegions) time to run, and is run on `topLevelRegions` at every
 * document change.  Normally, this would be a performance concern, but relatively speaking, a file
 * will have far fewer regions than lines, and we already parse the full document on every change.
 * If there are performance issues with this extension, `parseAllRegions` will likely be the much
 * bigger concern.
 */
export function flattenRegions(regions: Region[]): FlattenedRegion[] {
  const flattened: FlattenedRegion[] = [];
  let flatRegionIdx = 0;

  function traverse(region: Region): void {
    const flattenedRegion: FlattenedRegion = { ...region, flatRegionIdx: flatRegionIdx++ };
    flattened.push(flattenedRegion);
    for (const child of region.children) {
      traverse(child);
    }
  }

  for (const region of regions) {
    traverse(region);
  }

  return flattened;
}
