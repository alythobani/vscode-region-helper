import * as vscode from "vscode";
import { goToNextRegion, goToNextRegionCommandId } from "./commands/goToNextRegion";
import { goToPreviousRegion, goToPreviousRegionCommandId } from "./commands/goToPreviousRegion";
import { goToRegionBoundary, goToRegionBoundaryCommandId } from "./commands/goToRegionBoundary";
import {
  goToRegionFromQuickPick,
  goToRegionFromQuickPickCommandId,
} from "./commands/goToRegionFromQuickPick";
import { selectCurrentRegion, selectCurrentRegionCommandId } from "./commands/selectCurrentRegion";
import { RegionDiagnosticsManager } from "./diagnostics/RegionDiagnosticsManager";
import { type FlattenedRegion } from "./lib/flattenRegions";
import { type InvalidMarker } from "./lib/parseAllRegions";
import { type Region } from "./models/Region";
import { RegionStore } from "./state/RegionStore";
import { RegionTreeViewProvider } from "./treeView/RegionTreeViewProvider";
import { goToRegionTreeItem, goToRegionTreeItemCommandId } from "./treeView/goToRegionTreeItem";

export type RegionHelperAPI = {
  getTopLevelRegions(): Region[];
  getFlattenedRegions(): FlattenedRegion[];
  getActiveRegion(): Region | undefined;
  getInvalidMarkers(): InvalidMarker[];
  onDidChangeRegions: vscode.Event<void>;
  onDidChangeActiveRegion: vscode.Event<void>;
  onDidChangeInvalidMarkers: vscode.Event<void>;
};

export function activate(context: vscode.ExtensionContext): RegionHelperAPI {
  console.log("Activating extension 'Region Helper'");

  const { subscriptions } = context;
  const regionStore = RegionStore.initialize(subscriptions);

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
  registerCommand(goToNextRegionCommandId, () => goToNextRegion(regionStore));
  registerCommand(goToPreviousRegionCommandId, () => goToPreviousRegion(regionStore));

  function registerCommand(
    commandId: string,
    callback: Parameters<typeof vscode.commands.registerCommand>[1]
  ): void {
    const command = vscode.commands.registerCommand(commandId, callback);
    subscriptions.push(command);
  }

  return {
    getTopLevelRegions(): Region[] {
      return regionStore.topLevelRegions;
    },
    getFlattenedRegions(): FlattenedRegion[] {
      return regionStore.flattenedRegions;
    },
    getActiveRegion(): Region | undefined {
      return regionStore.activeRegion;
    },
    getInvalidMarkers(): InvalidMarker[] {
      return regionStore.invalidMarkers;
    },
    onDidChangeRegions: regionStore.onDidChangeRegions,
    onDidChangeActiveRegion: regionStore.onDidChangeActiveRegion,
    onDidChangeInvalidMarkers: regionStore.onDidChangeInvalidMarkers,
  };
}

export function deactivate(): void {
  // Do nothing
}
