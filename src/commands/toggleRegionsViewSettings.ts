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

const stopFollowingActiveRegionCommand: RegionHelperCommand = {
  id: "regionHelper.regionsView.stopFollowingActiveRegion",
  callback: stopFollowingActiveRegion,
  needsRegionStore: false,
};

const startFollowingActiveRegionCommand: RegionHelperCommand = {
  id: "regionHelper.regionsView.startFollowingActiveRegion",
  callback: startFollowingActiveRegion,
  needsRegionStore: false,
};

export const allRegionsViewConfigCommands: RegionHelperCommand[] = [
  hideRegionsViewCommand,
  showRegionsViewCommand,
  stopFollowingActiveRegionCommand,
  startFollowingActiveRegionCommand,
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

function stopFollowingActiveRegion(): void {
  setGlobalRegionsViewConfigValue("shouldFollowActiveRegion", false);
}

function startFollowingActiveRegion(): void {
  setGlobalRegionsViewConfigValue("shouldFollowActiveRegion", true);
}
