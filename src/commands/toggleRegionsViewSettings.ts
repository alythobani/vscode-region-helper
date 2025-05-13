import * as vscode from "vscode";
import {
  getGlobalRegionsViewConfigValue,
  setGlobalRegionsViewConfigValue,
  setRegionsViewVisibility,
} from "../config/regionsViewConfig";
import { type RegionHelperNonStoresCommand } from "./registerCommand";

const hideRegionsViewCommand: RegionHelperNonStoresCommand = {
  id: "regionHelper.regionsView.hide",
  callback: hideRegionsView,
  needsStoreParams: false,
};

const showRegionsViewCommand: RegionHelperNonStoresCommand = {
  id: "regionHelper.regionsView.show",
  callback: showRegionsView,
  needsStoreParams: false,
};

const stopAutoHighlightingActiveRegionCommand: RegionHelperNonStoresCommand = {
  id: "regionHelper.regionsView.stopAutoHighlightingActiveRegion",
  callback: stopAutoHighlightingActiveRegion,
  needsStoreParams: false,
};

const startAutoHighlightingActiveRegionCommand: RegionHelperNonStoresCommand = {
  id: "regionHelper.regionsView.startAutoHighlightingActiveRegion",
  callback: startAutoHighlightingActiveRegion,
  needsStoreParams: false,
};

export const allRegionsViewConfigCommands: RegionHelperNonStoresCommand[] = [
  hideRegionsViewCommand,
  showRegionsViewCommand,
  stopAutoHighlightingActiveRegionCommand,
  startAutoHighlightingActiveRegionCommand,
];

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
