import * as vscode from "vscode";
import { getCursorActiveLineIdx } from "../lib/getCursorActiveLineIdx";
import { getCursorActiveRegion } from "../lib/getCursorActiveRegion";
import { selectLines } from "../lib/utils/selectionUtils";
import { type RegionStore } from "../state/RegionStore";

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
