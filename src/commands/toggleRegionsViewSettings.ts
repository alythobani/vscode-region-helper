import * as vscode from "vscode";
import {
  getGlobalRegionsViewConfigValue,
  setGlobalRegionsViewConfigValue,
  setRegionsViewVisibility,
} from "../config/regionsViewConfig";
import { type RegionHelperCommand } from "./registerCommand";

const hideRegionsViewCommand: RegionHelperCommand = {
  id: "regionHelper.regionsView.hide",
  callback: hideRegionsView,
  needsRegionStore: false,
};

const showRegionsViewCommand: RegionHelperCommand = {
  id: "regionHelper.regionsView.show",
  callback: showRegionsView,
  needsRegionStore: false,
};

const stopAutoHighlightingActiveRegionCommand: RegionHelperCommand = {
  id: "regionHelper.regionsView.stopAutoHighlightingActiveRegion",
  callback: stopAutoHighlightingActiveRegion,
  needsRegionStore: false,
};

const startAutoHighlightingActiveRegionCommand: RegionHelperCommand = {
  id: "regionHelper.regionsView.startAutoHighlightingActiveRegion",
  callback: startAutoHighlightingActiveRegion,
  needsRegionStore: false,
};

export const allRegionsViewConfigCommands: RegionHelperCommand[] = [
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
