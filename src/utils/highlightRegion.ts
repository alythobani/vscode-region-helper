import * as vscode from "vscode";
import { scrollLineIntoView } from "./scrollUtils";

const decorationType = vscode.window.createTextEditorDecorationType({
  backgroundColor: new vscode.ThemeColor("editor.findMatchHighlightBackground"),
});

export function highlightAndScrollRegionIntoView({
  activeTextEditor,
  startLineIdx,
  endLineIdx,
  revealType,
}: {
  activeTextEditor: vscode.TextEditor;
  startLineIdx: number;
  endLineIdx: number;
  revealType: vscode.TextEditorRevealType;
}): void {
  highlightRegion({ activeTextEditor, startLineIdx, endLineIdx });
  scrollLineIntoView({ editor: activeTextEditor, lineIdx: startLineIdx, revealType });
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
