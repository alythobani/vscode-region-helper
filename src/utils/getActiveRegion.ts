import * as vscode from "vscode";
import { type Region } from "../models/Region";
import { getActiveCursorLineIdx } from "./getActiveCursorLineIdx";

export function getActiveRegion(topLevelRegions: Region[]): Region | undefined {
  console.log("getActiveRegion");
  const { activeTextEditor } = vscode.window;
  if (!activeTextEditor) {
    return undefined;
  }
  return getActiveRegionInEditor(topLevelRegions, activeTextEditor);
}

export function getActiveRegionInEditor(
  topLevelRegions: Region[],
  activeTextEditor: vscode.TextEditor
): Region | undefined {
  const cursorLine = getActiveCursorLineIdx(activeTextEditor);
  console.log("cursorLine", cursorLine);
  return getActiveRegionAtLine(topLevelRegions, cursorLine);
}

export function getActiveRegionAtLine(regions: Region[], cursorLine: number): Region | undefined {
  for (const region of regions) {
    if (cursorLine < region.startLineIdx || cursorLine > region.endLineIdx) {
      continue;
    }
    return getActiveRegionAtLine(region.children, cursorLine) ?? region;
  }
  return undefined;
}
