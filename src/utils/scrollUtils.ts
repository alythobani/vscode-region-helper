import * as vscode from "vscode";
import { getActiveCursorLineIdx } from "./getActiveCursorLineIdx";

export function scrollCurrentLineIntoView(editor: vscode.TextEditor): void {
  const currentLineIdx = getActiveCursorLineIdx(editor);
  scrollLineIntoView(editor, currentLineIdx);
}

export function scrollLineIntoView(editor: vscode.TextEditor, lineIdx: number): void {
  const position = new vscode.Position(lineIdx, 0);
  editor.revealRange(
    new vscode.Range(position, position),
    vscode.TextEditorRevealType.InCenterIfOutsideViewport
  );
}
