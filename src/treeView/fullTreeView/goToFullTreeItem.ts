import * as vscode from "vscode";
import { focusEditor } from "../../utils/focusEditor";
import { moveCursorToFirstNonWhitespaceCharOfLine } from "../../utils/moveCursorToFirstNonWhitespaceOfLine";
import { moveCursorToPosition } from "../../utils/moveCursorToPosition";

export const goToFullTreeItemCommandId = "region-helper.goToFullTreeItem";

export function goToFullTreeItem(startLineIdx: number, startCharacter: number | undefined): void {
  const { activeTextEditor } = vscode.window;
  if (!activeTextEditor) {
    return;
  }
  if (startCharacter === undefined) {
    moveCursorToFirstNonWhitespaceCharOfLine({
      activeTextEditor,
      lineIdx: startLineIdx,
      revealType: vscode.TextEditorRevealType.InCenterIfOutsideViewport,
    });
  } else {
    moveCursorToPosition({
      activeTextEditor,
      lineIdx: startLineIdx,
      character: startCharacter,
      revealType: vscode.TextEditorRevealType.InCenterIfOutsideViewport,
    });
  }
  focusEditor(activeTextEditor);
}
