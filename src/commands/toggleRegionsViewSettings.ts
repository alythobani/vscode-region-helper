import * as vscode from "vscode";
import {
  getGlobalRegionsViewConfigValue,
  setGlobalRegionsViewConfigValue,
  setRegionsViewVisibility,
} from "../config/regionsViewConfig";
import { type RegionHelperNonClosuredCommand } from "./registerCommand";

/** Key used by RegionsViewAutoHideManager to persist user preference */
const USER_WANTS_REGIONS_VIEW_KEY = "regionHelper.userWantsRegionsView";

// #region Exported commands

const hideRegionsViewCommand: RegionHelperNonClosuredCommand = {
  id: "regionHelper.regionsView.hide",
  callback: hideRegionsView,
  needsRegionHelperParams: false,
};

const showRegionsViewCommand: RegionHelperNonClosuredCommand = {
  id: "regionHelper.regionsView.show",
  callback: showRegionsView,
  needsRegionHelperParams: false,
};

const stopAutoHighlightingActiveRegionCommand: RegionHelperNonClosuredCommand = {
  id: "regionHelper.regionsView.stopAutoHighlightingActiveRegion",
  callback: stopAutoHighlightingActiveRegion,
  needsRegionHelperParams: false,
};

const startAutoHighlightingActiveRegionCommand: RegionHelperNonClosuredCommand = {
  id: "regionHelper.regionsView.startAutoHighlightingActiveRegion",
  callback: startAutoHighlightingActiveRegion,
  needsRegionHelperParams: false,
};

export const allRegionsViewConfigCommands: RegionHelperNonClosuredCommand[] = [
  hideRegionsViewCommand,
  showRegionsViewCommand,
  stopAutoHighlightingActiveRegionCommand,
  startAutoHighlightingActiveRegionCommand,
];

// #endregion

// #region Command implementations

function hideRegionsView(): void {
  const isAlreadyVisible = getGlobalRegionsViewConfigValue("isVisible");
  if (!isAlreadyVisible) {
    vscode.window.showInformationMessage("Region Helper: Regions view is already hidden.");
    return;
  }
  setRegionsViewVisibility(false);
}

function showRegionsView(): void {
  const isAlreadyVisible = getGlobalRegionsViewConfigValue("isVisible");
  if (isAlreadyVisible) {
    vscode.window.showInformationMessage("Region Helper: Regions view is already visible.");
    return;
  }
  setRegionsViewVisibility(true);
}

function stopAutoHighlightingActiveRegion(): void {
  setGlobalRegionsViewConfigValue("shouldAutoHighlightActiveRegion", false);
}

function startAutoHighlightingActiveRegion(): void {
  setGlobalRegionsViewConfigValue("shouldAutoHighlightActiveRegion", true);
}

// #endregion

// #region Reset command - exposed for extension.ts to use

/**
 * Resets the auto-hide user preference in workspace state.
 * This is called by the extension when registering the reset command.
 */
export function createResetAutoHidePreferenceCommand(
  workspaceState: vscode.Memento
): () => Promise<void> {
  return async (): Promise<void> => {
    // Reset the user preference to true (wants to see the view)
    await workspaceState.update(USER_WANTS_REGIONS_VIEW_KEY, true);
    // Also show the view immediately
    await setGlobalRegionsViewConfigValue("isVisible", true);
    vscode.window.showInformationMessage(
      "Region Helper: Auto-hide preference has been reset. The Regions view will now auto-show when you open files with regions."
    );
  };
}

// #endregion
