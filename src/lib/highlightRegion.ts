import * as vscode from "vscode";
import { scrollLineIntoView } from "./scrollUtils";

const decorationType = vscode.window.createTextEditorDecorationType({
  backgroundColor: new vscode.ThemeColor("editor.findMatchHighlightBackground"),
});

export function highlightAndScrollRegionIntoView({
  activeTextEditor,
  startLineIdx,
  endLineIdx,
}: {
  activeTextEditor: vscode.TextEditor;
  startLineIdx: number;
  endLineIdx: number;
}): void {
  highlightRegion({ activeTextEditor, startLineIdx, endLineIdx });
  scrollLineIntoView(activeTextEditor, startLineIdx);
}

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
      range: new vscode.Range(startLineIdx, 0, endLineIdx + 1, 0),
    },
  ]);
}

export function clearHighlightedRegions(activeTextEditor: vscode.TextEditor): void {
  activeTextEditor.setDecorations(decorationType, []);
}
