import type * as vscode from "vscode";
import { type Region } from "../models/Region";

export function getRegionDisplayName(region: Region): string {
  return region.name ?? "Unnamed region";
}

export function getRegionRangeText(region: Region): string {
  return getLinesText(region);
}

export function getLinesText({
  startLineIdx,
  endLineIdx,
}: {
  startLineIdx: number;
  endLineIdx: number;
}): string {
  return `Lines ${startLineIdx + 1} to ${endLineIdx + 1}`;
}

export function getRangeText(range: vscode.Range): string {
  return getLinesText({ startLineIdx: range.start.line, endLineIdx: range.end.line });
}
