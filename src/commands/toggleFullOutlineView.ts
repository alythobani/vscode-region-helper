import * as vscode from "vscode";

import {
  getGlobalRegionHelperConfigValue,
  setShouldShowFullOutlineView,
} from "../config/regionHelperConfig";

export const hideFullOutlineViewCommandId = "region-helper.hideFullOutlineView";
export const showFullOutlineViewCommandId = "region-helper.showFullOutlineView";

export function hideFullOutlineView(): void {
  const currentValue = getGlobalRegionHelperConfigValue("shouldShowFullOutlineView");
  if (currentValue === false) {
    vscode.window.showInformationMessage("Region Helper: Full Outline view is already hidden.");
    return;
  }
  setShouldShowFullOutlineView(false);
}

export function showFullOutlineView(): void {
  const currentValue = getGlobalRegionHelperConfigValue("shouldShowFullOutlineView");
  if (currentValue === true) {
    vscode.window.showInformationMessage("Region Helper: Full Outline view is already visible.");
    return;
  }
  setShouldShowFullOutlineView(true);
}
