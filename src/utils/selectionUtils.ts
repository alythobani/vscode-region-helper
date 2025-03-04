import * as vscode from "vscode";

export function selectLines({
  activeTextEditor,
  startLineIdx,
  endLineIdx,
  endLineCharacterIdx,
}: {
  activeTextEditor: vscode.TextEditor;
  startLineIdx: number;
  endLineIdx: number;
  endLineCharacterIdx: number;
}): void {
  const selectionRange = new vscode.Selection(startLineIdx, 0, endLineIdx, endLineCharacterIdx);
  activeTextEditor.selection = selectionRange;
  activeTextEditor.revealRange(
    selectionRange,
    vscode.TextEditorRevealType.InCenterIfOutsideViewport
  );
}
