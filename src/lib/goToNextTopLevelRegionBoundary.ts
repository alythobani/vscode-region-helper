import type * as vscode from "vscode";
import { type Region } from "../models/Region";
import { moveCursorToFirstNonWhitespaceCharOfLine } from "../utils/moveCursorToFirstNonWhitespaceOfLine";

/**
 * Moves the cursor to the start boundary of the first region past the cursor.
 *
 * Does NOT circle back to the start of the document if the cursor is already past the last region.
 */
export function goToNextTopLevelRegionBoundary({
  activeTextEditor,
  topLevelRegions,
  cursorLine,
}: {
  activeTextEditor: vscode.TextEditor;
  topLevelRegions: Region[];
  cursorLine: number;
}): void {
  for (const region of topLevelRegions) {
    if (region.startLineIdx > cursorLine) {
      moveCursorToFirstNonWhitespaceCharOfLine(activeTextEditor, region.startLineIdx);
      return;
    }
  }
}
