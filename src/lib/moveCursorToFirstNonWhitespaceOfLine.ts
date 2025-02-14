import * as vscode from "vscode";

export function moveCursorToFirstNonWhitespaceCharOfLine(
  activeTextEditor: vscode.TextEditor,
  startLineIdx: number
): void {
  const firstCharIdx = getFirstNonWhitespaceCharacterIndex(activeTextEditor, startLineIdx);
  const position = new vscode.Position(startLineIdx, firstCharIdx);
  activeTextEditor.selection = new vscode.Selection(position, position);
  activeTextEditor.revealRange(
    new vscode.Range(position, position),
    vscode.TextEditorRevealType.InCenterIfOutsideViewport
  );
}

function getFirstNonWhitespaceCharacterIndex(editor: vscode.TextEditor, lineIdx: number): number {
  const line = editor.document.lineAt(lineIdx);
  return line.firstNonWhitespaceCharacterIndex;
}
