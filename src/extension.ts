import * as vscode from "vscode";
import {
  goToMatchingRegionBoundary,
  goToMatchingRegionBoundaryCommandId,
} from "./commands/goToMatchingRegionBoundary";
import { RegionTreeViewProvider } from "./treeView/RegionTreeViewProvider";
import { goToRegion, goToRegionCommandId } from "./treeView/goToRegion";

export function activate(context: vscode.ExtensionContext): void {
  console.log("Activating extension 'Region Helper'");

  const regionTreeViewProvider = new RegionTreeViewProvider();
  const treeView = vscode.window.createTreeView("regionHelperTreeView", {
    treeDataProvider: regionTreeViewProvider,
  });
  regionTreeViewProvider.setTreeView(treeView);

  const goToRegionCommand = vscode.commands.registerCommand(goToRegionCommandId, goToRegion);
  const goToMatchingRegionBoundaryCommand = vscode.commands.registerCommand(
    goToMatchingRegionBoundaryCommandId,
    goToMatchingRegionBoundary
  );

  context.subscriptions.push(goToRegionCommand, goToMatchingRegionBoundaryCommand);
}

// This method is called when your extension is deactivated
export function deactivate(): void {
  // Do nothing
}
