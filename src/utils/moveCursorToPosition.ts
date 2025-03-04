import * as vscode from "vscode";

export function moveCursorToPosition({
  activeTextEditor,
  lineIdx,
  character,
  revealType,
}: {
  activeTextEditor: vscode.TextEditor;
  lineIdx: number;
  character: number;
  revealType: vscode.TextEditorRevealType;
}): void {
  const position = new vscode.Position(lineIdx, character);
  const selection = new vscode.Selection(position, position);
  activeTextEditor.selection = selection;
  activeTextEditor.revealRange(selection, revealType);
}
