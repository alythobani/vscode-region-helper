import * as vscode from "vscode";
import { type RegionStore } from "../state/RegionStore";
import { getCursorActiveLineIdx } from "../utils/getCursorActiveLineIdx";
import { getCursorActiveRegion } from "../utils/getCursorActiveRegion";
import { selectLines } from "../utils/selectionUtils";

export const selectCurrentRegionCommandId = "region-helper.selectCurrentRegion";

export function selectCurrentRegion(regionStore: RegionStore): void {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const cursorLineIdx = getCursorActiveLineIdx(editor);
  const currentActiveRegion = getCursorActiveRegion(regionStore.topLevelRegions, cursorLineIdx);
  if (!currentActiveRegion) {
    return;
  }
  const { startLineIdx, endLineIdx } = currentActiveRegion;
  selectLines({ editor, startLineIdx, endLineIdx });
}
