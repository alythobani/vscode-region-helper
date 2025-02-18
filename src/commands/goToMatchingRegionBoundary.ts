import * as vscode from "vscode";
import { type Region } from "../models/Region";
import { type RegionStore } from "../state/RegionStore";
import { getActiveCursorLineIdx } from "../utils/getActiveCursorLineIdx";
import { moveCursorToFirstNonWhitespaceCharOfLine } from "../utils/moveCursorToFirstNonWhitespaceOfLine";

export const goToMatchingRegionBoundaryCommandId = "region-helper.goToMatchingRegionBoundary";

export function goToMatchingRegionBoundary(regionStore: RegionStore): void {
  const { activeTextEditor } = vscode.window;
  const { activeRegion } = regionStore;
  if (!activeTextEditor || !activeRegion) {
    return;
  }
  const cursorLine = getActiveCursorLineIdx(activeTextEditor);
  const regionBoundaryLine = getRegionBoundaryLineForJump(activeRegion, cursorLine);
  moveCursorToFirstNonWhitespaceCharOfLine(activeTextEditor, regionBoundaryLine);
}

function getRegionBoundaryLineForJump(activeRegion: Region, cursorLine: number): number {
  const { startLineIdx, endLineIdx } = activeRegion;
  if (cursorLine === startLineIdx) {
    return endLineIdx;
  }
  if (cursorLine === endLineIdx) {
    return startLineIdx;
  }
  return endLineIdx;
}
