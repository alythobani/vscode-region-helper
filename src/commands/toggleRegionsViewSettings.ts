import * as vscode from "vscode";
import {
  getGlobalRegionsViewConfigValue,
  setGlobalRegionsViewConfigValue,
  setRegionsViewVisibility,
} from "../config/regionsViewConfig";
import { type RegionHelperNonClosuredCommand } from "./registerCommand";

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
