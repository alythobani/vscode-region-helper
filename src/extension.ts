import * as vscode from "vscode";
import { goToRegionBoundary, goToRegionBoundaryCommandId } from "./commands/goToRegionBoundary";
import {
  goToRegionFromQuickPick,
  goToRegionFromQuickPickCommandId,
} from "./commands/goToRegionFromQuickPick";
import { selectCurrentRegion, selectCurrentRegionCommandId } from "./commands/selectCurrentRegion";
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
  registerCommand(goToRegionBoundaryCommandId, () => goToRegionBoundary(regionStore));
  registerCommand(selectCurrentRegionCommandId, () => selectCurrentRegion(regionStore));
  registerCommand(goToRegionFromQuickPickCommandId, () =>
    goToRegionFromQuickPick(regionStore, context.subscriptions)
  );

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
