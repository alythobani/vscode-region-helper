import type * as vscode from "vscode";
import { type Region } from "../models/Region";

export function getRegionRange(region: Region): vscode.Range {
  return region.range;
}
