import * as vscode from "vscode";
import { type RegionStore } from "../state/RegionStore";
import { goToFullTreeItemCommand } from "../treeView/fullTreeView/goToFullTreeItem";
import { goToRegionTreeItemCommand } from "../treeView/regionTreeView/goToRegionTreeItem";
import { allExpandAndCollapseAllCommands } from "./expandAndCollapseAll";
import { goToNextRegionCommand } from "./goToNextRegion";
import { goToPreviousRegionCommand } from "./goToPreviousRegion";
import { goToRegionBoundaryCommand } from "./goToRegionBoundary";
import { goToRegionFromQuickPickCommand } from "./goToRegionFromQuickPick";
import { selectCurrentRegionCommand } from "./selectCurrentRegion";
import { allFullOutlineViewConfigCommands } from "./toggleFullOutlineViewSettings";
import { allRegionsViewConfigCommands } from "./toggleRegionsViewSettings";

type RegionHelperExtensionId = "regionHelper";

type RegionHelperCommandId = `${RegionHelperExtensionId}.${string}`;

export type RegionHelperStoreParams = {
  regionStore: RegionStore;
};

export type RegionHelperClosuredCommandCallback = (params: RegionHelperStoreParams) => void;

/** A command suitable for the command palette, thus needs a closure for access to store params. */
export type RegionHelperStoresCommand = {
  id: RegionHelperCommandId;
  callback: RegionHelperClosuredCommandCallback;
  needsStoreParams: true;
};

/** A command that needs args passed in when called (thus not suitable for e.g. the Command Palette). */
export type RegionHelperNonStoresCommand = {
  id: RegionHelperCommandId;
  callback: Parameters<typeof vscode.commands.registerCommand>[1];
  needsStoreParams: false;
};

type RegionHelperCommand = RegionHelperStoresCommand | RegionHelperNonStoresCommand;

export function registerAllCommands(
  subscriptions: vscode.Disposable[],
  callbackParams: RegionHelperStoreParams
): void {
  for (const command of commandsToRegister) {
    registerRegionHelperCommand(command, subscriptions, callbackParams);
  }
}

const commandsToRegister: RegionHelperCommand[] = [
  goToRegionTreeItemCommand,
  goToFullTreeItemCommand,
  goToRegionBoundaryCommand,
  selectCurrentRegionCommand,
  goToRegionFromQuickPickCommand,
  goToNextRegionCommand,
  goToPreviousRegionCommand,
  ...allRegionsViewConfigCommands,
  ...allFullOutlineViewConfigCommands,
  ...allExpandAndCollapseAllCommands,
];

function registerRegionHelperCommand(
  command: RegionHelperCommand,
  subscriptions: vscode.Disposable[],
  callbackParams: RegionHelperStoreParams
): void {
  const { id, callback, needsStoreParams } = command;
  const commandDisposable = vscode.commands.registerCommand(
    id,
    needsStoreParams ? (): void => callback(callbackParams) : callback
  );
  subscriptions.push(commandDisposable);
}
