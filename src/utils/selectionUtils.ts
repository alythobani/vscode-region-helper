import * as vscode from "vscode";

export function selectRange({
  activeTextEditor,
  range,
}: {
  activeTextEditor: vscode.TextEditor;
  range: vscode.Range;
}): void {
  const selectionRange = new vscode.Selection(
    range.start.line,
    range.start.character,
    range.end.line,
    range.end.character
  );
  activeTextEditor.selection = selectionRange;
  activeTextEditor.revealRange(
    selectionRange,
    vscode.TextEditorRevealType.InCenterIfOutsideViewport
  );
}
