import * as vscode from "vscode";
import { getNextRegion } from "../lib/getNextRegion";
import { moveCursorToRegion } from "../lib/moveCursorToRegion";
import { getActiveCursorLineIdx } from "../utils/getActiveCursorLineIdx";
import { type RegionHelperStoreParams, type RegionHelperStoresCommand } from "./registerCommand";

export const goToNextRegionCommand: RegionHelperStoresCommand = {
  id: "regionHelper.goToNextRegion",
  callback: goToNextRegion,
  needsStoreParams: true,
};

function goToNextRegion({ regionStore }: RegionHelperStoreParams): void {
  const { flattenedRegions } = regionStore;
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
