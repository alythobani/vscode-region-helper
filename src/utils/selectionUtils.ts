import * as vscode from "vscode";

export function selectLines({
  activeTextEditor,
  startLineIdx,
  endLineIdx,
}: {
  activeTextEditor: vscode.TextEditor;
  startLineIdx: number;
  endLineIdx: number;
}): void {
  activeTextEditor.selection = new vscode.Selection(startLineIdx, 0, endLineIdx + 1, 0);
  activeTextEditor.revealRange(
    new vscode.Range(startLineIdx, 0, endLineIdx + 1, 0),
    vscode.TextEditorRevealType.InCenterIfOutsideViewport
  );
}
