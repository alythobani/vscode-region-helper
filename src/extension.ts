import * as vscode from "vscode";
import {
  goToMatchingRegionBoundary,
  goToMatchingRegionBoundaryCommandId,
} from "./commands/goToMatchingRegionBoundary";
import { RegionStore } from "./state/RegionStore";
import { RegionTreeViewProvider } from "./treeView/RegionTreeViewProvider";
import { goToRegion, goToRegionCommandId } from "./treeView/goToRegion";

export function activate(context: vscode.ExtensionContext): void {
  console.log("Activating extension 'Region Helper'");

  const regionStore = new RegionStore(context.subscriptions);

  const regionTreeViewProvider = new RegionTreeViewProvider(regionStore, context.subscriptions);
  const treeView = vscode.window.createTreeView("regionHelperTreeView", {
    treeDataProvider: regionTreeViewProvider,
  });
  regionTreeViewProvider.setTreeView(treeView);

  const goToRegionCommand = vscode.commands.registerCommand(goToRegionCommandId, goToRegion);
  const goToMatchingRegionBoundaryCommand = vscode.commands.registerCommand(
    goToMatchingRegionBoundaryCommandId,
    () => goToMatchingRegionBoundary(regionStore)
  );

  context.subscriptions.push(goToRegionCommand, goToMatchingRegionBoundaryCommand);
}

export function deactivate(): void {
  // Do nothing
}
