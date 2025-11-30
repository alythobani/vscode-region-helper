import * as vscode from "vscode";
import { goToNextTopLevelRegionBoundary } from "../lib/goToNextTopLevelRegionBoundary";
import { type Region } from "../models/Region";
import { getActiveCursorLineIdx } from "../utils/getActiveCursorLineIdx";
import { moveCursorToFirstNonWhitespaceCharOfLine } from "../utils/moveCursorToFirstNonWhitespaceOfLine";
import {
    type RegionHelperClosuredCommand,
    type RegionHelperClosuredParams,
} from "./registerCommand";

export const goToRegionBoundaryCommand: RegionHelperClosuredCommand = {
  id: "regionHelper.goToRegionBoundary",
  callback: goToRegionBoundary,
  needsRegionHelperParams: true,
};

function goToRegionBoundary({ regionStore }: RegionHelperClosuredParams): void {
  const { activeTextEditor } = vscode.window;
  if (!activeTextEditor) {
    return;
  }
  const cursorLine = getActiveCursorLineIdx(activeTextEditor);
  const { topLevelRegions, activeRegion } = regionStore;
  if (!activeRegion) {
    // If there is a next region to jump to, it will be a top-level region.
    goToNextTopLevelRegionBoundary({
      activeTextEditor,
      topLevelRegions,
      cursorLine,
      revealType: vscode.TextEditorRevealType.Default,
    });
    return;
  }
  const regionBoundaryLineIdx = getRegionBoundaryLineForJump(activeRegion, cursorLine);
  moveCursorToFirstNonWhitespaceCharOfLine({
    activeTextEditor,
    lineIdx: regionBoundaryLineIdx,
    revealType: vscode.TextEditorRevealType.Default,
  });
}

function getRegionBoundaryLineForJump(activeRegion: Region, cursorLine: number): number {
  const startLineIdx = activeRegion.range.start.line;
  const endLineIdx = activeRegion.range.end.line;
  if (cursorLine === startLineIdx) {
    return endLineIdx;
  }
  if (cursorLine === endLineIdx) {
    return startLineIdx;
  }
  return endLineIdx;
}
