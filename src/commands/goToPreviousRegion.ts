import * as vscode from "vscode";
import { getPreviousRegion } from "../lib/getPreviousRegion";
import { moveCursorToRegion } from "../lib/moveCursorToRegion";
import { type RegionStore } from "../state/RegionStore";

export const goToPreviousRegionCommandId = "region-helper.goToPreviousRegion";

export function goToPreviousRegion({
  flattenedRegions,
}: Pick<RegionStore, "flattenedRegions">): void {
  const { activeTextEditor } = vscode.window;
  if (!activeTextEditor) {
    return;
  }
  const maybePreviousRegion = getPreviousRegion(flattenedRegions, activeTextEditor);
  if (!maybePreviousRegion) {
    return;
  }
  moveCursorToRegion(activeTextEditor, maybePreviousRegion);
}
