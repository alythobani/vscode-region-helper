import * as vscode from "vscode";
import { type RegionStore } from "../state/RegionStore";
import { goToFullTreeItemCommand } from "../treeView/fullTreeView/goToFullTreeItem";
import { goToRegionTreeItemCommand } from "../treeView/regionTreeView/goToRegionTreeItem";
import { goToNextRegionCommand } from "./goToNextRegion";
import { goToPreviousRegionCommand } from "./goToPreviousRegion";
import { goToRegionBoundaryCommand } from "./goToRegionBoundary";
import { goToRegionFromQuickPickCommand } from "./goToRegionFromQuickPick";
import { selectCurrentRegionCommand } from "./selectCurrentRegion";
import { allFullOutlineViewConfigCommands } from "./toggleFullOutlineViewSettings";
import { allRegionsViewConfigCommands } from "./toggleRegionsViewSettings";

type RegionHelperExtensionId = "regionHelper";

type RegionHelperCommandId = `${RegionHelperExtensionId}.${string}`;

export type RegionHelperCommand = {
  id: RegionHelperCommandId;
  callback: Parameters<typeof vscode.commands.registerCommand>[1];
  // TODO: better type safety for this (make sure needsRegionStore is true if and only if callback needs it)
  needsRegionStore: boolean;
};

export function registerAllCommands(
  subscriptions: vscode.Disposable[],
  regionStore: RegionStore
): void {
  for (const command of commandsToRegister) {
    registerRegionHelperCommand(command, subscriptions, regionStore);
  }
}

const commandsToRegister = [
  goToRegionTreeItemCommand,
  goToFullTreeItemCommand,
  goToRegionBoundaryCommand,
  selectCurrentRegionCommand,
  goToRegionFromQuickPickCommand,
  goToNextRegionCommand,
  goToPreviousRegionCommand,
  ...allRegionsViewConfigCommands,
  ...allFullOutlineViewConfigCommands,
];

function registerRegionHelperCommand(
  command: RegionHelperCommand,
  subscriptions: vscode.Disposable[],
  regionStore: RegionStore
): void {
  const { id, callback, needsRegionStore } = command;
  const commandDisposable = vscode.commands.registerCommand(
    id,
    needsRegionStore ? makeRegionStoreCallback(regionStore, callback) : callback
  );
  subscriptions.push(commandDisposable);
}

function makeRegionStoreCallback(
  regionStore: RegionStore,
  callback: (regionStore: RegionStore) => void
): () => void {
  return () => callback(regionStore);
}
