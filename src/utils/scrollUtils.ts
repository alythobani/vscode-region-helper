import * as vscode from "vscode";
import { getCursorActiveLineIdx } from "./getCursorActiveLineIdx";

export function scrollCurrentLineIntoView(editor: vscode.TextEditor): void {
  const currentLineIdx = getCursorActiveLineIdx(editor);
  scrollLineIntoView(editor, currentLineIdx);
}

export function scrollLineIntoView(editor: vscode.TextEditor, lineIdx: number): void {
  const position = new vscode.Position(lineIdx, 0);
  editor.revealRange(
    new vscode.Range(position, position),
    vscode.TextEditorRevealType.InCenterIfOutsideViewport
  );
}
