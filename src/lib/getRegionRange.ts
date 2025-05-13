import * as vscode from "vscode";
import { type Region } from "../models/Region";

export function getRegionRange(region: Region): vscode.Range {
  const { startLineIdx, endLineIdx, endLineCharacterIdx } = region;
  return new vscode.Range(startLineIdx, 0, endLineIdx, endLineCharacterIdx);
}
