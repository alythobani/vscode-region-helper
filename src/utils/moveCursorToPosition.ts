import * as vscode from "vscode";

export function moveCursorToPosition(
  textEditor: vscode.TextEditor,
  lineIdx: number,
  character: number
): void {
  const position = new vscode.Position(lineIdx, character);
  const selection = new vscode.Selection(position, position);
  textEditor.selection = selection;
  textEditor.revealRange(selection, vscode.TextEditorRevealType.InCenter);
}
