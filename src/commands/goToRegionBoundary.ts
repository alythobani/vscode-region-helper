import * as vscode from "vscode";
import { goToNextTopLevelRegionBoundary } from "../lib/goToNextTopLevelRegionBoundary";
import { type Region } from "../models/Region";
import { type RegionStore } from "../state/RegionStore";
import { getActiveCursorLineIdx } from "../utils/getActiveCursorLineIdx";
import { moveCursorToFirstNonWhitespaceCharOfLine } from "../utils/moveCursorToFirstNonWhitespaceOfLine";

export const goToRegionBoundaryCommandId = "region-helper.goToRegionBoundary";

export function goToRegionBoundary(regionStore: RegionStore): void {
  const { activeTextEditor } = vscode.window;
  if (!activeTextEditor) {
    return;
  }
  const cursorLine = getActiveCursorLineIdx(activeTextEditor);
  const { topLevelRegions, activeRegion } = regionStore;
  if (!activeRegion) {
    // If there is a next region to jump to, it will be a top-level region.
    goToNextTopLevelRegionBoundary({ activeTextEditor, topLevelRegions, cursorLine });
    return;
  }
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
