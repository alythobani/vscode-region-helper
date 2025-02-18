import * as vscode from "vscode";
import { type RegionStore } from "../state/RegionStore";
import { getCursorActiveLineIdx } from "../utils/getCursorActiveLineIdx";
import { getCursorActiveRegion } from "../utils/getCursorActiveRegion";
import { moveCursorToFirstNonWhitespaceCharOfLine } from "../utils/moveCursorToFirstNonWhitespaceOfLine";

export const goToMatchingRegionBoundaryCommandId = "region-helper.goToMatchingRegionBoundary";

export function goToMatchingRegionBoundary(regionStore: RegionStore): void {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const cursorLine = getCursorActiveLineIdx(editor);
  const mostNestedRegion = getCursorActiveRegion(regionStore.topLevelRegions, cursorLine);
  if (!mostNestedRegion) {
    return;
  }

  let targetLine: number;
  if (cursorLine === mostNestedRegion.startLineIdx) {
    targetLine = mostNestedRegion.endLineIdx; // Jump to matching #endregion
  } else if (cursorLine === mostNestedRegion.endLineIdx) {
    targetLine = mostNestedRegion.startLineIdx; // Jump to matching #region
  } else {
    targetLine = mostNestedRegion.endLineIdx; // Inside the region, jump to its end
  }

  moveCursorToFirstNonWhitespaceCharOfLine(editor, targetLine);
}
