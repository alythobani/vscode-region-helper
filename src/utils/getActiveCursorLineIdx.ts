import type * as vscode from "vscode";

export function getActiveCursorLineIdx(editor: vscode.TextEditor): number {
  return editor.selection.active.line;
}
