import * as vscode from "vscode";
import { type RegionHelperNonClosuredCommand } from "../../commands/registerCommand";
import { focusActiveEditorGroup } from "../../utils/focusEditor";
import { moveCursorToFirstNonWhitespaceCharOfLine } from "../../utils/moveCursorToFirstNonWhitespaceOfLine";

export const goToRegionTreeItemCommand: RegionHelperNonClosuredCommand = {
  id: "regionHelper.goToRegionTreeItem",
  callback: goToRegionTreeItem,
  needsRegionHelperParams: false,
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
  void focusActiveEditorGroup();
}
