import * as vscode from "vscode";
import { getActiveCursorLineIdx } from "./getActiveCursorLineIdx";

export function scrollCurrentLineIntoView({
  editor,
  revealType,
}: {
  editor: vscode.TextEditor;
  revealType: vscode.TextEditorRevealType;
}): void {
  const currentLineIdx = getActiveCursorLineIdx(editor);
  scrollLineIntoView({ editor, lineIdx: currentLineIdx, revealType });
}

export function scrollLineIntoView({
  editor,
  lineIdx,
  revealType,
}: {
  editor: vscode.TextEditor;
  lineIdx: number;
  revealType: vscode.TextEditorRevealType;
}): void {
  const position = new vscode.Position(lineIdx, 0);
  editor.revealRange(new vscode.Range(position, position), revealType);
}
