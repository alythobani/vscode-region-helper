import * as vscode from "vscode";
import { parseAllRegions } from "../lib/parseAllRegions";
import { type Region } from "../models/Region";

export const goToMatchingRegionBoundaryCommandId = "region-helper.goToMatchingRegionBoundary";

export function goToMatchingRegionBoundary(): void {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showInformationMessage("No active text editor.");
    return;
  }

  const document = editor.document;
  const cursorLine = editor.selection.active.line;

  // Get all regions in the current document
  const { topLevelRegions } = parseAllRegions(document);
  const matchingLine = findMatchingBoundary(topLevelRegions, cursorLine);

  if (matchingLine !== undefined) {
    moveCursorToLine(editor, matchingLine);
  } else {
    vscode.window.showInformationMessage("Cursor is not on a region boundary.");
  }
}

function findMatchingBoundary(regions: Region[], cursorLine: number): number | undefined {
  for (const region of regions) {
    if (cursorLine === region.startLineIdx) {
      return region.endLineIdx; // Jump to #endregion
    }
    if (cursorLine === region.endLineIdx) {
      return region.startLineIdx; // Jump to #region
    }
    const nestedMatch = findMatchingBoundary(region.children, cursorLine);
    if (nestedMatch !== undefined) {
      return nestedMatch;
    }
  }
  return undefined;
}

function moveCursorToLine(editor: vscode.TextEditor, lineIdx: number): void {
  const position = new vscode.Position(lineIdx, 0);
  editor.selection = new vscode.Selection(position, position);
  editor.revealRange(
    new vscode.Range(position, position),
    vscode.TextEditorRevealType.InCenterIfOutsideViewport
  );
}
