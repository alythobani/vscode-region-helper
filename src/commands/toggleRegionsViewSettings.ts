import * as vscode from "vscode";
import {
  getGlobalRegionsViewConfigValue,
  setGlobalRegionsViewConfigValue,
  type RegionsViewShowMode,
} from "../config/regionsViewConfig";
import { type RegionHelperNonClosuredCommand } from "./registerCommand";

// #region Exported commands

const neverShowRegionsViewCommand: RegionHelperNonClosuredCommand = {
  id: "regionHelper.regionsView.showNever",
  callback: neverShowRegionsView,
  needsRegionHelperParams: false,
};

const alwaysShowRegionsViewCommand: RegionHelperNonClosuredCommand = {
  id: "regionHelper.regionsView.showAlways",
  callback: alwaysShowRegionsView,
  needsRegionHelperParams: false,
};

const showRegionsViewWhenRegionsExistCommand: RegionHelperNonClosuredCommand = {
  id: "regionHelper.regionsView.showWhenRegionsExist",
  callback: showRegionsViewWhenRegionsExist,
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
  neverShowRegionsViewCommand,
  alwaysShowRegionsViewCommand,
  showRegionsViewWhenRegionsExistCommand,
  stopAutoHighlightingActiveRegionCommand,
  startAutoHighlightingActiveRegionCommand,
];

// #endregion

// #region Command implementations

function neverShowRegionsView(): void {
  const show = getGlobalRegionsViewConfigValue("show");
  if (show === "never") {
    vscode.window.showInformationMessage(
      "Region Helper: Regions view is already set to never show."
    );
    return;
  }
  setRegionsViewShow("never");
}

function alwaysShowRegionsView(): void {
  const show = getGlobalRegionsViewConfigValue("show");
  if (show === "always") {
    vscode.window.showInformationMessage(
      "Region Helper: Regions view is already set to always show."
    );
    return;
  }
  setRegionsViewShow("always");
}

function showRegionsViewWhenRegionsExist(): void {
  const show = getGlobalRegionsViewConfigValue("show");
  if (show === "whenRegionsExist") {
    vscode.window.showInformationMessage(
      "Region Helper: Regions view is already set to show only when regions exist."
    );
    return;
  }
  setRegionsViewShow("whenRegionsExist");
}

function setRegionsViewShow(show: RegionsViewShowMode): void {
  setGlobalRegionsViewConfigValue("show", show);
}

function stopAutoHighlightingActiveRegion(): void {
  setGlobalRegionsViewConfigValue("shouldAutoHighlightActiveRegion", false);
}

function startAutoHighlightingActiveRegion(): void {
  setGlobalRegionsViewConfigValue("shouldAutoHighlightActiveRegion", true);
}

// #endregion
