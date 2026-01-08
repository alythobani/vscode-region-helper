import * as vscode from "vscode";

/** Shows the given editor.
 *
 * Not currently used anywhere, but kept for reference. Was previously used as a way to focus the
 * active editor after clicking a tree item to navigate to it, but this was buggy for Jupyter
 * notebooks (would open the cell contents in a new read-only editor). */
export function showEditor(editor: vscode.TextEditor): void {
  vscode.window.showTextDocument(editor.document, editor.viewColumn);
}

/** Focuses the active editor group. */
export async function focusActiveEditorGroup(): Promise<void> {
  await vscode.commands.executeCommand("workbench.action.focusActiveEditorGroup");
}
