import * as vscode from "vscode";
import { getPreviousRegion } from "../lib/getPreviousRegion";
import { moveCursorToRegion } from "../lib/moveCursorToRegion";
import { getActiveCursorLineIdx } from "../utils/getActiveCursorLineIdx";
import {
  type RegionHelperClosuredCommand,
  type RegionHelperClosuredParams,
} from "./registerCommand";

export const goToPreviousRegionCommand: RegionHelperClosuredCommand = {
  id: "regionHelper.goToPreviousRegion",
  callback: goToPreviousRegion,
  needsRegionHelperParams: true,
};

function goToPreviousRegion({ regionStore }: RegionHelperClosuredParams): void {
  const { flattenedRegions } = regionStore;
  const { activeTextEditor } = vscode.window;
  if (!activeTextEditor) {
    return;
  }
  const cursorLineIdx = getActiveCursorLineIdx(activeTextEditor);
  const maybePreviousRegion = getPreviousRegion(flattenedRegions, cursorLineIdx);
  if (!maybePreviousRegion) {
    return;
  }
  moveCursorToRegion({
    activeTextEditor,
    region: maybePreviousRegion,
    revealType: vscode.TextEditorRevealType.Default,
  });
}
