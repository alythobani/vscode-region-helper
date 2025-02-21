import * as vscode from "vscode";
import { getNextRegion } from "../lib/getNextRegion";
import { moveCursorToRegion } from "../lib/moveCursorToRegion";
import { type RegionStore } from "../state/RegionStore";

export const goToNextRegionCommandId = "region-helper.goToNextRegion";

export function goToNextRegion({
  topLevelRegions,
  activeRegion,
}: Pick<RegionStore, "topLevelRegions" | "activeRegion">): void {
  const { activeTextEditor } = vscode.window;
  if (!activeTextEditor) {
    return;
  }
  const maybeNextRegion = getNextRegion({ topLevelRegions, activeRegion }, activeTextEditor);
  if (!maybeNextRegion) {
    return;
  }
  moveCursorToRegion(activeTextEditor, maybeNextRegion);
}
