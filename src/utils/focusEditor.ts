import * as vscode from "vscode";

export function focusEditor(activeTextEditor: vscode.TextEditor): void {
  vscode.window.showTextDocument(activeTextEditor.document, activeTextEditor.viewColumn);
}
