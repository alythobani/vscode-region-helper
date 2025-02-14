import * as vscode from "vscode";
import { getCursorActiveRegion } from "../lib/getCursorActiveRegion";
import { parseAllRegions } from "../lib/parseAllRegions";

export const goToMatchingRegionBoundaryCommandId = "region-helper.goToMatchingRegionBoundary";

export function goToMatchingRegionBoundary(): void {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const document = editor.document;
  const cursorLine = editor.selection.active.line;

  // Get all regions in the current document
  const { topLevelRegions } = parseAllRegions(document);
  const mostNestedRegion = getCursorActiveRegion(topLevelRegions, cursorLine);
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

  moveCursorToLine(editor, targetLine);
}

function moveCursorToLine(editor: vscode.TextEditor, lineIdx: number): void {
  const position = new vscode.Position(lineIdx, 0);
  editor.selection = new vscode.Selection(position, position);
  editor.revealRange(
    new vscode.Range(position, position),
    vscode.TextEditorRevealType.InCenterIfOutsideViewport
  );
}
