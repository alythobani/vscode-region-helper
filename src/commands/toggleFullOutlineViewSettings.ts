import * as vscode from "vscode";

import {
  getGlobalFullOutlineViewConfigValue,
  setGlobalFullOutlineViewConfigValue,
} from "../config/fullOutlineViewConfig";
import { type RegionHelperNonClosuredCommand } from "./registerCommand";

// #region Exported commands

const hideFullOutlineViewCommand: RegionHelperNonClosuredCommand = {
  id: "regionHelper.fullOutlineView.hide",
  callback: hideFullOutlineView,
  needsRegionHelperParams: false,
};

const showFullOutlineViewCommand: RegionHelperNonClosuredCommand = {
  id: "regionHelper.fullOutlineView.show",
  callback: showFullOutlineView,
  needsRegionHelperParams: false,
};

const stopAutoHighlightingActiveItemCommand: RegionHelperNonClosuredCommand = {
  id: "regionHelper.fullOutlineView.stopAutoHighlightingActiveItem",
  callback: stopAutoHighlightingActiveItem,
  needsRegionHelperParams: false,
};

const startAutoHighlightingActiveItemCommand: RegionHelperNonClosuredCommand = {
  id: "regionHelper.fullOutlineView.startAutoHighlightingActiveItem",
  callback: startAutoHighlightingActiveItem,
  needsRegionHelperParams: false,
};

export const allFullOutlineViewConfigCommands = [
  hideFullOutlineViewCommand,
  showFullOutlineViewCommand,
  stopAutoHighlightingActiveItemCommand,
  startAutoHighlightingActiveItemCommand,
];

// #endregion

// #region Command implementations

function hideFullOutlineView(): void {
  const isAlreadyVisible = getGlobalFullOutlineViewConfigValue("isVisible");
  if (!isAlreadyVisible) {
    vscode.window.showInformationMessage("Region Helper: Full Outline view is already hidden.");
    return;
  }
  setGlobalFullOutlineViewConfigValue("isVisible", false);
}

function showFullOutlineView(): void {
  const isAlreadyVisible = getGlobalFullOutlineViewConfigValue("isVisible");
  if (isAlreadyVisible) {
    vscode.window.showInformationMessage("Region Helper: Full Outline view is already visible.");
    return;
  }
  setGlobalFullOutlineViewConfigValue("isVisible", true);
}

function stopAutoHighlightingActiveItem(): void {
  const isAlreadyAutoHighlightingActiveItem = getGlobalFullOutlineViewConfigValue(
    "shouldAutoHighlightActiveItem"
  );
  if (!isAlreadyAutoHighlightingActiveItem) {
    vscode.window.showInformationMessage(
      "Region Helper: Full Outline view is already not auto-highlighting the active item."
    );
    return;
  }
  setGlobalFullOutlineViewConfigValue("shouldAutoHighlightActiveItem", false);
}

function startAutoHighlightingActiveItem(): void {
  const isAlreadyAutoHighlightingActiveItem = getGlobalFullOutlineViewConfigValue(
    "shouldAutoHighlightActiveItem"
  );
  if (isAlreadyAutoHighlightingActiveItem) {
    vscode.window.showInformationMessage(
      "Region Helper: Full Outline view is already auto-highlighting the active item."
    );
    return;
  }
  setGlobalFullOutlineViewConfigValue("shouldAutoHighlightActiveItem", true);
}

// #endregion
