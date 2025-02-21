import type * as vscode from "vscode";
import { type Region } from "../models/Region";
import { moveCursorToFirstNonWhitespaceCharOfLine } from "../utils/moveCursorToFirstNonWhitespaceOfLine";

export function moveCursorToRegion(activeTextEditor: vscode.TextEditor, region: Region): void {
  moveCursorToFirstNonWhitespaceCharOfLine(activeTextEditor, region.startLineIdx);
}
