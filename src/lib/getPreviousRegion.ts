import type * as vscode from "vscode";

import { type Region } from "../models/Region";
import { type RegionStore } from "../state/RegionStore";
import { getActiveCursorLineIdx } from "../utils/getActiveCursorLineIdx";

/**
 * Returns the previous region before the cursor, circling back to the last region if necessary.
 */
export function getPreviousRegion(
  flattenedRegions: RegionStore["flattenedRegions"],
  activeTextEditor: vscode.TextEditor
): Region | undefined {
  const cursorLine = getActiveCursorLineIdx(activeTextEditor);
  for (let i = flattenedRegions.length - 1; i >= 0; i--) {
    const region = flattenedRegions[i];
    if (region && region.startLineIdx < cursorLine) {
      return region;
    }
  }
  return flattenedRegions[flattenedRegions.length - 1];
}
