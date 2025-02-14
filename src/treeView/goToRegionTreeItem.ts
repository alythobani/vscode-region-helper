import * as vscode from "vscode";
import { moveCursorToFirstNonWhitespaceCharOfLine } from "../lib/moveCursorToFirstNonWhitespaceOfLine";

export const goToRegionTreeItemCommandId = "region-helper.goToRegionTreeItem";

export function goToRegionTreeItem(startLineIdx: number): void {
  const { activeTextEditor } = vscode.window;
  if (!activeTextEditor) {
    return;
  }
  moveCursorToFirstNonWhitespaceCharOfLine(activeTextEditor, startLineIdx);
  focusEditor(activeTextEditor);
}

function focusEditor(activeTextEditor: vscode.TextEditor): void {
  vscode.window.showTextDocument(activeTextEditor.document, activeTextEditor.viewColumn);
}
