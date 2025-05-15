import * as vscode from "vscode";
import { getActiveRegionInEditor } from "../utils/getActiveRegion";
import { selectLines } from "../utils/selectionUtils";
import {
  type RegionHelperClosuredCommand,
  type RegionHelperClosuredParams,
} from "./registerCommand";

export const selectCurrentRegionCommand: RegionHelperClosuredCommand = {
  id: "regionHelper.selectCurrentRegion",
  callback: selectCurrentRegion,
  needsRegionHelperParams: true,
};

function selectCurrentRegion({ regionStore }: RegionHelperClosuredParams): void {
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
