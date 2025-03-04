import * as vscode from "vscode";
import { getNextRegion } from "../lib/getNextRegion";
import { moveCursorToRegion } from "../lib/moveCursorToRegion";
import { type RegionStore } from "../state/RegionStore";
import { getActiveCursorLineIdx } from "../utils/getActiveCursorLineIdx";

export const goToNextRegionCommandId = "region-helper.goToNextRegion";

export function goToNextRegion({ flattenedRegions }: Pick<RegionStore, "flattenedRegions">): void {
  const { activeTextEditor } = vscode.window;
  if (!activeTextEditor) {
    return;
  }
  const cursorLineIdx = getActiveCursorLineIdx(activeTextEditor);
  const maybeNextRegion = getNextRegion(flattenedRegions, cursorLineIdx);
  if (!maybeNextRegion) {
    return;
  }
  moveCursorToRegion({
    activeTextEditor,
    region: maybeNextRegion,
    revealType: vscode.TextEditorRevealType.Default,
  });
}
