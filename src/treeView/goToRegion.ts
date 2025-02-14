import * as vscode from "vscode";

export const goToRegionCommandId = "region-helper.goToRegion";

export function goToRegion(startLineIdx: number): void {
  const { activeTextEditor } = vscode.window;
  if (!activeTextEditor) {
    return;
  }
  const position = new vscode.Position(startLineIdx, 0);
  console.log("Going to region at line", startLineIdx);
  activeTextEditor.selection = new vscode.Selection(position, position);
  activeTextEditor.revealRange(
    new vscode.Range(position, position),
    vscode.TextEditorRevealType.InCenterIfOutsideViewport
  );
  console.log("Region at line", startLineIdx, "is now visible");
}
