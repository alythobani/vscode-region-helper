import * as vscode from "vscode";

export function selectLines({
  editor,
  startLineIdx,
  endLineIdx,
}: {
  editor: vscode.TextEditor;
  startLineIdx: number;
  endLineIdx: number;
}): void {
  editor.selection = new vscode.Selection(startLineIdx, 0, endLineIdx + 1, 0);
  editor.revealRange(
    new vscode.Range(startLineIdx, 0, endLineIdx + 1, 0),
    vscode.TextEditorRevealType.InCenterIfOutsideViewport
  );
}
