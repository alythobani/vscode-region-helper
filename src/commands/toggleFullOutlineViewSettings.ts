import * as vscode from "vscode";

import {
  getGlobalFullOutlineViewConfigValue,
  setGlobalFullOutlineViewConfigValue,
} from "../config/fullOutlineViewConfig";
import { type RegionHelperCommand } from "./registerCommand";

const hideFullOutlineViewCommand: RegionHelperCommand = {
  id: "regionHelper.fullOutlineView.hide",
  callback: hideFullOutlineView,
  needsRegionStore: false,
};

const showFullOutlineViewCommand: RegionHelperCommand = {
  id: "regionHelper.fullOutlineView.show",
  callback: showFullOutlineView,
  needsRegionStore: false,
};

const stopAutoHighlightingActiveItemCommand: RegionHelperCommand = {
  id: "regionHelper.fullOutlineView.stopAutoHighlightingActiveItem",
  callback: stopAutoHighlightingActiveItem,
  needsRegionStore: false,
};

const startAutoHighlightingActiveItemCommand: RegionHelperCommand = {
  id: "regionHelper.fullOutlineView.startAutoHighlightingActiveItem",
  callback: startAutoHighlightingActiveItem,
  needsRegionStore: false,
};

export const allFullOutlineViewConfigCommands = [
  hideFullOutlineViewCommand,
  showFullOutlineViewCommand,
  stopAutoHighlightingActiveItemCommand,
  startAutoHighlightingActiveItemCommand,
];

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
