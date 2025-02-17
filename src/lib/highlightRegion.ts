import * as vscode from "vscode";

const decorationType = vscode.window.createTextEditorDecorationType({
  backgroundColor: new vscode.ThemeColor("editor.findMatchHighlightBackground"),
});

export function highlightRegion({
  activeTextEditor,
  startLineIdx,
  endLineIdx,
}: {
  activeTextEditor: vscode.TextEditor;
  startLineIdx: number;
  endLineIdx: number;
}): void {
  activeTextEditor.setDecorations(decorationType, [
    {
      range: new vscode.Range(startLineIdx, 0, endLineIdx, 0),
    },
  ]);
}

export function clearHighlightedRegions(activeTextEditor: vscode.TextEditor): void {
  activeTextEditor.setDecorations(decorationType, []);
}
