import * as vscode from "vscode";
import { type RegionStore } from "../state/RegionStore";
import { type FullTreeViewProvider } from "../treeView/fullTreeView/FullTreeViewProvider";
import { goToFullTreeItemCommand } from "../treeView/fullTreeView/goToFullTreeItem";
import { goToRegionTreeItemCommand } from "../treeView/regionTreeView/goToRegionTreeItem";
import { allExpandAllCommands } from "./expandAndCollapseAll";
import { goToNextRegionCommand } from "./goToNextRegion";
import { goToPreviousRegionCommand } from "./goToPreviousRegion";
import { goToRegionBoundaryCommand } from "./goToRegionBoundary";
import { goToRegionFromQuickPickCommand } from "./goToRegionFromQuickPick";
import { selectCurrentRegionCommand } from "./selectCurrentRegion";
import { allFullOutlineViewConfigCommands } from "./toggleFullOutlineViewSettings";
import { allRegionsViewConfigCommands } from "./toggleRegionsViewSettings";

type RegionHelperExtensionId = "regionHelper";

type RegionHelperCommandId = `${RegionHelperExtensionId}.${string}`;

export type RegionHelperClosuredParams = {
  regionStore: RegionStore;
  fullTreeViewProvider: FullTreeViewProvider;
};

/** A command that needs access to RegionHelperClosuredParams. */
export type RegionHelperClosuredCommand = {
  id: RegionHelperCommandId;
  callback: (regionHelperParams: RegionHelperClosuredParams) => void;
  needsRegionHelperParams: true;
};

/** A command that doesn't need access to RegionHelperClosuredParams. */
export type RegionHelperNonClosuredCommand = {
  id: RegionHelperCommandId;
  callback: Parameters<typeof vscode.commands.registerCommand>[1];
  needsRegionHelperParams: false;
};

type RegionHelperCommand = RegionHelperClosuredCommand | RegionHelperNonClosuredCommand;

export function registerAllCommands(
  subscriptions: vscode.Disposable[],
  regionHelperParams: RegionHelperClosuredParams
): void {
  for (const command of commandsToRegister) {
    registerRegionHelperCommand(command, subscriptions, regionHelperParams);
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
  ...allExpandAllCommands,
];

function registerRegionHelperCommand(
  command: RegionHelperCommand,
  subscriptions: vscode.Disposable[],
  regionHelperParams: RegionHelperClosuredParams
): void {
  const { id, callback, needsRegionHelperParams } = command;
  const commandDisposable = vscode.commands.registerCommand(
    id,
    needsRegionHelperParams ? (): void => callback(regionHelperParams) : callback
  );
  subscriptions.push(commandDisposable);
}
