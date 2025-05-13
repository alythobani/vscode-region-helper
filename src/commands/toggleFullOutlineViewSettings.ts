import * as vscode from "vscode";

import {
  getGlobalFullOutlineViewConfigValue,
  setGlobalFullOutlineViewConfigValue,
} from "../config/fullOutlineViewConfig";
import { type RegionHelperNonStoresCommand } from "./registerCommand";

const hideFullOutlineViewCommand: RegionHelperNonStoresCommand = {
  id: "regionHelper.fullOutlineView.hide",
  callback: hideFullOutlineView,
  needsStoreParams: false,
};

const showFullOutlineViewCommand: RegionHelperNonStoresCommand = {
  id: "regionHelper.fullOutlineView.show",
  callback: showFullOutlineView,
  needsStoreParams: false,
};

const stopAutoHighlightingActiveItemCommand: RegionHelperNonStoresCommand = {
  id: "regionHelper.fullOutlineView.stopAutoHighlightingActiveItem",
  callback: stopAutoHighlightingActiveItem,
  needsStoreParams: false,
};

const startAutoHighlightingActiveItemCommand: RegionHelperNonStoresCommand = {
  id: "regionHelper.fullOutlineView.startAutoHighlightingActiveItem",
  callback: startAutoHighlightingActiveItem,
  needsStoreParams: false,
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
