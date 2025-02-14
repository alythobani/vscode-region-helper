import * as vscode from "vscode";
import {
  goToMatchingRegionBoundary,
  goToMatchingRegionBoundaryCommandId,
} from "./commands/goToMatchingRegionBoundary";
import {
  goToRegionFromQuickPick,
  goToRegionFromQuickPickCommandId,
} from "./commands/goToRegionFromQuickPick";
import { RegionStore } from "./state/RegionStore";
import { RegionTreeViewProvider } from "./treeView/RegionTreeViewProvider";
import { goToRegionTreeItem, goToRegionTreeItemCommandId } from "./treeView/goToRegionTreeItem";

export function activate(context: vscode.ExtensionContext): void {
  console.log("Activating extension 'Region Helper'");

  const regionStore = new RegionStore(context.subscriptions);

  const regionTreeViewProvider = new RegionTreeViewProvider(regionStore, context.subscriptions);
  const treeView = vscode.window.createTreeView("regionHelperTreeView", {
    treeDataProvider: regionTreeViewProvider,
  });
  regionTreeViewProvider.setTreeView(treeView);

  registerCommand(goToRegionTreeItemCommandId, goToRegionTreeItem);
  registerCommand(goToMatchingRegionBoundaryCommandId, () =>
    goToMatchingRegionBoundary(regionStore)
  );
  registerCommand(goToRegionFromQuickPickCommandId, () => goToRegionFromQuickPick(regionStore));

  function registerCommand(
    commandId: string,
    callback: Parameters<typeof vscode.commands.registerCommand>[1]
  ): void {
    const command = vscode.commands.registerCommand(commandId, callback);
    context.subscriptions.push(command);
  }
}

export function deactivate(): void {
  // Do nothing
}
