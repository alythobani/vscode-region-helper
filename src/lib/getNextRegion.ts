import type * as vscode from "vscode";

import { type Region } from "../models/Region";
import { type RegionStore } from "../state/RegionStore";
import { getActiveCursorLineIdx } from "../utils/getActiveCursorLineIdx";

/**
 * Returns the next region after the cursor, circling back to the first region if necessary.
 */
export function getNextRegion(
  { topLevelRegions, activeRegion }: Pick<RegionStore, "topLevelRegions" | "activeRegion">,
  activeTextEditor: vscode.TextEditor
): Region | undefined {
  const cursorLine = getActiveCursorLineIdx(activeTextEditor);
  if (!activeRegion) {
    // If the cursor is not already within a region, the next region will be a top-level region.
    return getNextTopLevelRegion({ topLevelRegions, cursorLine });
  }

  const maybeNextChildRegion = getNextChildRegion({ activeRegion, cursorLine });
  if (maybeNextChildRegion) {
    return maybeNextChildRegion;
  }

  return getNextSiblingOrHigherLevelRegion({ activeRegion, topLevelRegions });
}

/**
 * Returns the next top-level region after the cursor, circling back to the first region if necessary.
 */
function getNextTopLevelRegion({
  topLevelRegions,
  cursorLine,
}: {
  topLevelRegions: Region[];
  cursorLine: number;
}): Region | undefined {
  for (const region of topLevelRegions) {
    if (region.startLineIdx > cursorLine) {
      return region;
    }
  }
  return topLevelRegions[0];
}

/**
 * Returns the next child region after the cursor, or undefined if there is no next child region.
 *
 * Does not circle around to the first child.
 */
function getNextChildRegion({
  activeRegion,
  cursorLine,
}: {
  activeRegion: Region;
  cursorLine: number;
}): Region | undefined {
  for (const childRegion of activeRegion.children) {
    if (childRegion.startLineIdx > cursorLine) {
      return childRegion;
    }
  }
  return undefined;
}

/**
 * Returns the next sibling or higher-level region after `activeRegion`, going up a tree level when
 * reaching a final child, and circling back to the first top level region if necessary.
 */
function getNextSiblingOrHigherLevelRegion({
  activeRegion,
  topLevelRegions,
}: {
  activeRegion: Region;
  topLevelRegions: Region[];
}): Region | undefined {
  let child = activeRegion;
  while (child.parent) {
    const maybeNextSibling = child.parent.children[child.regionIdx + 1];
    if (maybeNextSibling) {
      return maybeNextSibling;
    }
    child = child.parent;
  }
  return topLevelRegions[child.regionIdx + 1] ?? topLevelRegions[0];
}
