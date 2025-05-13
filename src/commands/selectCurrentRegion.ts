import * as vscode from "vscode";
import { getActiveRegionInEditor } from "../utils/getActiveRegion";
import { selectLines } from "../utils/selectionUtils";
import { type RegionHelperStoreParams, type RegionHelperStoresCommand } from "./registerCommand";

export const selectCurrentRegionCommand: RegionHelperStoresCommand = {
  id: "regionHelper.selectCurrentRegion",
  callback: selectCurrentRegion,
  needsStoreParams: true,
};

function selectCurrentRegion({ regionStore }: RegionHelperStoreParams): void {
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
