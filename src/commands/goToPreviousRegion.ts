import * as vscode from "vscode";
import { getPreviousRegion } from "../lib/getPreviousRegion";
import { moveCursorToRegion } from "../lib/moveCursorToRegion";
import { type RegionStore } from "../state/RegionStore";
import { getActiveCursorLineIdx } from "../utils/getActiveCursorLineIdx";
import { type RegionHelperCommand } from "./registerCommand";

export const goToPreviousRegionCommand: RegionHelperCommand = {
  id: "regionHelper.goToPreviousRegion",
  callback: goToPreviousRegion,
  needsRegionStore: true,
};

function goToPreviousRegion({ flattenedRegions }: Pick<RegionStore, "flattenedRegions">): void {
  const { activeTextEditor } = vscode.window;
  if (!activeTextEditor) {
    return;
  }
  const cursorLineIdx = getActiveCursorLineIdx(activeTextEditor);
  const maybePreviousRegion = getPreviousRegion(flattenedRegions, cursorLineIdx);
  if (!maybePreviousRegion) {
    return;
  }
  moveCursorToRegion({
    activeTextEditor,
    region: maybePreviousRegion,
    revealType: vscode.TextEditorRevealType.Default,
  });
}
