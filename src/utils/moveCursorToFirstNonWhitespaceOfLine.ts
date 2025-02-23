import type * as vscode from "vscode";
import { moveCursorToPosition } from "./moveCursorToPosition";

export function moveCursorToFirstNonWhitespaceCharOfLine(
  activeTextEditor: vscode.TextEditor,
  startLineIdx: number
): void {
  const firstCharIdx = getFirstNonWhitespaceCharacterIndex(activeTextEditor, startLineIdx);
  moveCursorToPosition(activeTextEditor, startLineIdx, firstCharIdx);
}

function getFirstNonWhitespaceCharacterIndex(editor: vscode.TextEditor, lineIdx: number): number {
  const line = editor.document.lineAt(lineIdx);
  return line.firstNonWhitespaceCharacterIndex;
}
