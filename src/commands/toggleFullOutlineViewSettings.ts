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

const stopFollowingActiveItemCommand: RegionHelperCommand = {
  id: "regionHelper.fullOutlineView.stopFollowingActiveItem",
  callback: stopFollowingActiveItem,
  needsRegionStore: false,
};

const startFollowingActiveItemCommand: RegionHelperCommand = {
  id: "regionHelper.fullOutlineView.startFollowingActiveItem",
  callback: startFollowingActiveItem,
  needsRegionStore: false,
};

export const allFullOutlineViewConfigCommands = [
  hideFullOutlineViewCommand,
  showFullOutlineViewCommand,
  stopFollowingActiveItemCommand,
  startFollowingActiveItemCommand,
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

function stopFollowingActiveItem(): void {
  const isAlreadyFollowingActiveItem =
    getGlobalFullOutlineViewConfigValue("shouldFollowActiveItem");
  if (!isAlreadyFollowingActiveItem) {
    vscode.window.showInformationMessage(
      "Region Helper: Full Outline view is already not following the active item."
    );
    return;
  }
  setGlobalFullOutlineViewConfigValue("shouldFollowActiveItem", false);
}

function startFollowingActiveItem(): void {
  const isAlreadyFollowingActiveItem =
    getGlobalFullOutlineViewConfigValue("shouldFollowActiveItem");
  if (isAlreadyFollowingActiveItem) {
    vscode.window.showInformationMessage(
      "Region Helper: Full Outline view is already following the active item."
    );
    return;
  }
  setGlobalFullOutlineViewConfigValue("shouldFollowActiveItem", true);
}
