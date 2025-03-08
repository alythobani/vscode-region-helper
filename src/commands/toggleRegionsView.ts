import * as vscode from "vscode";

import {
  getGlobalRegionHelperConfigValue,
  setShouldShowRegionsView,
} from "../config/regionHelperConfig";

export const hideRegionsViewCommandId = "region-helper.hideRegionsView";
export const showRegionsViewCommandId = "region-helper.showRegionsView";

export function hideRegionsView(): void {
  const currentValue = getGlobalRegionHelperConfigValue("shouldShowRegionsView");
  if (currentValue === false) {
    vscode.window.showInformationMessage("Region Helper: Regions view is already hidden.");
    return;
  }
  setShouldShowRegionsView(false);
  // TODO: dispose the tree view and provider
}

export function showRegionsView(): void {
  const currentValue = getGlobalRegionHelperConfigValue("shouldShowRegionsView");
  if (currentValue === true) {
    vscode.window.showInformationMessage("Region Helper: Regions view is already visible.");
    return;
  }
  setShouldShowRegionsView(true);
  // TODO: create the tree view and provider
}
