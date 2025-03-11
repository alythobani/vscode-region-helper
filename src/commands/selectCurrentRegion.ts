import * as vscode from "vscode";
import { type RegionStore } from "../state/RegionStore";
import { getActiveRegionInEditor } from "../utils/getActiveRegion";
import { selectLines } from "../utils/selectionUtils";
import { type RegionHelperCommand } from "./registerCommand";

export const selectCurrentRegionCommand: RegionHelperCommand = {
  id: "regionHelper.selectCurrentRegion",
  callback: selectCurrentRegion,
  needsRegionStore: true,
};

function selectCurrentRegion(regionStore: RegionStore): void {
  const { activeTextEditor } = vscode.window;
  if (!activeTextEditor) {
    return;
  }

  const { topLevelRegions } = regionStore;
  const currentActiveRegion = getActiveRegionInEditor(topLevelRegions, activeTextEditor);
  if (!currentActiveRegion) {
    return;
  }
  const { startLineIdx, endLineIdx, endLineCharacterIdx } = currentActiveRegion;
  selectLines({ activeTextEditor, startLineIdx, endLineIdx, endLineCharacterIdx });
}
