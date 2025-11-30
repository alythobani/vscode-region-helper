import * as vscode from "vscode";
import { scrollLineIntoView } from "./scrollUtils";

const decorationType = vscode.window.createTextEditorDecorationType({
  backgroundColor: new vscode.ThemeColor("editor.findMatchHighlightBackground"),
});

export function highlightAndScrollRegionIntoView({
  activeTextEditor,
  range,
  revealType,
}: {
  activeTextEditor: vscode.TextEditor;
  range: vscode.Range;
  revealType: vscode.TextEditorRevealType;
}): void {
  highlightRegion({ activeTextEditor, range });
  scrollLineIntoView({ editor: activeTextEditor, lineIdx: range.start.line, revealType });
}

export function highlightRegion({
  activeTextEditor,
  range,
}: {
  activeTextEditor: vscode.TextEditor;
  range: vscode.Range;
}): void {
  activeTextEditor.setDecorations(decorationType, [
    {
      range: new vscode.Range(range.start.line, 0, range.end.line + 1, 0),
    },
  ]);
}

export function clearHighlightedRegions(activeTextEditor: vscode.TextEditor): void {
  activeTextEditor.setDecorations(decorationType, []);
}
