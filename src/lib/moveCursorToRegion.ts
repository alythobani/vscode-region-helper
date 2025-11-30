import type * as vscode from "vscode";
import { type Region } from "../models/Region";
import { moveCursorToFirstNonWhitespaceCharOfLine } from "../utils/moveCursorToFirstNonWhitespaceOfLine";

export function moveCursorToRegion({
  activeTextEditor,
  region,
  revealType,
}: {
  activeTextEditor: vscode.TextEditor;
  region: Region;
  revealType: vscode.TextEditorRevealType;
}): void {
  moveCursorToFirstNonWhitespaceCharOfLine({
    activeTextEditor,
    lineIdx: region.range.start.line,
    revealType,
  });
}
