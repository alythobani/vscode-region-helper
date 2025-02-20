import * as vscode from "vscode";
import { goToRegionBoundary, goToRegionBoundaryCommandId } from "./commands/goToRegionBoundary";
import {
  goToRegionFromQuickPick,
  goToRegionFromQuickPickCommandId,
} from "./commands/goToRegionFromQuickPick";
import { selectCurrentRegion, selectCurrentRegionCommandId } from "./commands/selectCurrentRegion";
import { RegionDiagnosticsManager } from "./diagnostics/RegionDiagnosticsManager";
import { RegionStore } from "./state/RegionStore";
import { RegionTreeViewProvider } from "./treeView/RegionTreeViewProvider";
import { goToRegionTreeItem, goToRegionTreeItemCommandId } from "./treeView/goToRegionTreeItem";

export function activate(context: vscode.ExtensionContext): void {
  console.log("Activating extension 'Region Helper'");

  const { subscriptions } = context;

  const regionStore = new RegionStore(subscriptions);

  const regionTreeViewProvider = new RegionTreeViewProvider(regionStore, subscriptions);
  const treeView = vscode.window.createTreeView("regionHelperTreeView", {
    treeDataProvider: regionTreeViewProvider,
  });
  regionTreeViewProvider.setTreeView(treeView);
  subscriptions.push(treeView);

  const regionDiagnosticsManager = new RegionDiagnosticsManager(regionStore, subscriptions);
  subscriptions.push(regionDiagnosticsManager.diagnostics);

  registerCommand(goToRegionTreeItemCommandId, goToRegionTreeItem);
  registerCommand(goToRegionBoundaryCommandId, () => goToRegionBoundary(regionStore));
  registerCommand(selectCurrentRegionCommandId, () => selectCurrentRegion(regionStore));
  registerCommand(goToRegionFromQuickPickCommandId, () => goToRegionFromQuickPick(regionStore));

  function registerCommand(
    commandId: string,
    callback: Parameters<typeof vscode.commands.registerCommand>[1]
  ): void {
    const command = vscode.commands.registerCommand(commandId, callback);
    subscriptions.push(command);
  }
}

export function deactivate(): void {
  // Do nothing
}
