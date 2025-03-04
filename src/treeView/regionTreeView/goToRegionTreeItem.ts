import * as vscode from "vscode";
import { focusEditor } from "../../utils/focusEditor";
import { moveCursorToFirstNonWhitespaceCharOfLine } from "../../utils/moveCursorToFirstNonWhitespaceOfLine";

export const goToRegionTreeItemCommandId = "region-helper.goToRegionTreeItem";

export function goToRegionTreeItem(startLineIdx: number): void {
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
