import type * as vscode from "vscode";
import { moveCursorToPosition } from "./moveCursorToPosition";

export function moveCursorToFirstNonWhitespaceCharOfLine({
  activeTextEditor,
  lineIdx,
  revealType,
}: {
  activeTextEditor: vscode.TextEditor;
  lineIdx: number;
  revealType: vscode.TextEditorRevealType;
}): void {
  const firstCharIdx = getFirstNonWhitespaceCharacterIndex(activeTextEditor, lineIdx);
  moveCursorToPosition({
    activeTextEditor,
    lineIdx,
    character: firstCharIdx,
    revealType,
  });
}

function getFirstNonWhitespaceCharacterIndex(editor: vscode.TextEditor, lineIdx: number): number {
  const line = editor.document.lineAt(lineIdx);
  return line.firstNonWhitespaceCharacterIndex;
}
