import * as vscode from "vscode";

export const goToRegionCommandId = "region-helper.goToRegion";

export function goToRegion(startLineIdx: number): void {
  const { activeTextEditor } = vscode.window;
  if (!activeTextEditor) {
    return;
  }
  const positionCharacter = getPositionCharacter(activeTextEditor, startLineIdx);
  const position = new vscode.Position(startLineIdx, positionCharacter);
  activeTextEditor.selection = new vscode.Selection(position, position);
  activeTextEditor.revealRange(
    new vscode.Range(position, position),
    vscode.TextEditorRevealType.InCenterIfOutsideViewport
  );
}

function getPositionCharacter(activeTextEditor: vscode.TextEditor, startLineIdx: number): number {
  const line = activeTextEditor.document.lineAt(startLineIdx);
  const { firstNonWhitespaceCharacterIndex } = line;
  return firstNonWhitespaceCharacterIndex;
}
