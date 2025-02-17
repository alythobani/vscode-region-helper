import type * as vscode from "vscode";

export function getCursorActiveLineIdx(editor: vscode.TextEditor): number {
  return editor.selection.active.line;
}
