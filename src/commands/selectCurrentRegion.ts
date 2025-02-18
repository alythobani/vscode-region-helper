import * as vscode from "vscode";
import { type RegionStore } from "../state/RegionStore";
import { getActiveRegionInEditor } from "../utils/getActiveRegion";
import { selectLines } from "../utils/selectionUtils";

export const selectCurrentRegionCommandId = "region-helper.selectCurrentRegion";

export function selectCurrentRegion(regionStore: RegionStore): void {
  const { activeTextEditor } = vscode.window;
  if (!activeTextEditor) {
    return;
  }

  const { topLevelRegions } = regionStore;
  const currentActiveRegion = getActiveRegionInEditor(topLevelRegions, activeTextEditor);
  if (!currentActiveRegion) {
    return;
  }
  const { startLineIdx, endLineIdx } = currentActiveRegion;
  selectLines({ activeTextEditor, startLineIdx, endLineIdx });
}
