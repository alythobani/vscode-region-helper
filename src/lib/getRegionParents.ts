import { type Region } from "../models/Region";

/**
 * Returns the parents of a region, in order from the top-level parent to the immediate parent.
 */
export function getRegionParents(region: Region): Region[] {
  const parents = [];
  let { parent } = region;
  while (parent) {
    parents.unshift(parent);
    parent = parent.parent;
  }
  return parents;
}
