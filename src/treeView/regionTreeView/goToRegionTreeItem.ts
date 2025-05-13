import * as vscode from "vscode";
import { type RegionHelperNonStoresCommand } from "../../commands/registerCommand";
import { focusEditor } from "../../utils/focusEditor";
import { moveCursorToFirstNonWhitespaceCharOfLine } from "../../utils/moveCursorToFirstNonWhitespaceOfLine";

export const goToRegionTreeItemCommand: RegionHelperNonStoresCommand = {
  id: "regionHelper.goToRegionTreeItem",
  callback: goToRegionTreeItem,
  needsStoreParams: false,
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
