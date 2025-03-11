import * as vscode from "vscode";
import { type RegionHelperCommand } from "../../commands/registerCommand";
import { focusEditor } from "../../utils/focusEditor";
import { moveCursorToFirstNonWhitespaceCharOfLine } from "../../utils/moveCursorToFirstNonWhitespaceOfLine";

export const goToRegionTreeItemCommand: RegionHelperCommand = {
  id: "regionHelper.goToRegionTreeItem",
  callback: goToRegionTreeItem,
  needsRegionStore: false,
};

function goToRegionTreeItem(startLineIdx: number): void {
  const { activeTextEditor } = vscode.window;
  if (!activeTextEditor) {
    return;
  }
  moveCursorToFirstNonWhitespaceCharOfLine({
    activeTextEditor,
    lineIdx: startLineIdx,
    revealType: vscode.TextEditorRevealType.InCenterIfOutsideViewport,
  });
  focusEditor(activeTextEditor);
}
