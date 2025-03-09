import * as vscode from "vscode";
import { goToNextRegion, goToNextRegionCommandId } from "./commands/goToNextRegion";
import { goToPreviousRegion, goToPreviousRegionCommandId } from "./commands/goToPreviousRegion";
import { goToRegionBoundary, goToRegionBoundaryCommandId } from "./commands/goToRegionBoundary";
import {
  goToRegionFromQuickPick,
  goToRegionFromQuickPickCommandId,
} from "./commands/goToRegionFromQuickPick";
import { selectCurrentRegion, selectCurrentRegionCommandId } from "./commands/selectCurrentRegion";
import {
  hideFullOutlineView,
  hideFullOutlineViewCommandId,
  showFullOutlineView,
  showFullOutlineViewCommandId,
} from "./commands/toggleFullOutlineView";
import {
  hideRegionsView,
  hideRegionsViewCommandId,
  showRegionsView,
  showRegionsViewCommandId,
} from "./commands/toggleRegionsView";
import { RegionDiagnosticsManager } from "./diagnostics/RegionDiagnosticsManager";
import { type FlattenedRegion } from "./lib/flattenRegions";
import { type InvalidMarker } from "./lib/parseAllRegions";
import { type Region } from "./models/Region";
import { DocumentSymbolStore } from "./state/DocumentSymbolStore";
import { FullOutlineStore } from "./state/FullOutlineStore";
import { RegionStore } from "./state/RegionStore";
import { type FullTreeItem } from "./treeView/fullTreeView/FullTreeItem";
import { FullTreeViewProvider } from "./treeView/fullTreeView/FullTreeViewProvider";
import {
  goToFullTreeItem,
  goToFullTreeItemCommandId,
} from "./treeView/fullTreeView/goToFullTreeItem";
import {
  goToRegionTreeItem,
  goToRegionTreeItemCommandId,
} from "./treeView/regionTreeView/goToRegionTreeItem";
import { RegionTreeViewProvider } from "./treeView/regionTreeView/RegionTreeViewProvider";

export type RegionHelperAPI = {
  // #region Region Store API
  // #region Getters
  /** Returns an up-to-date list of top-level regions in the current active editor. This is used to
   * render the tree view, for example. The list will be empty if no editor is active. */
  getTopLevelRegions(): Region[];
  /** Returns an up-to-date flat list of all regions in the current active editor, each of which has
   * an extra `flatRegionIdx` field on it. This is used when navigating to previous/next regions,
   * for example.  The list will be empty if no editor is active. */
  getFlattenedRegions(): FlattenedRegion[];
  /** Returns the currently active region in the current active editor, if any. */
  getActiveRegion(): Region | undefined;
  /** Returns an up-to-date list of invalid markers (unmatched boundaries) in the current active
   * editor. The list will be empty if no editor is active. */
  getInvalidMarkers(): InvalidMarker[];
  // #endregion
  // #region Events
  /** An event that fires when the list of regions in the current active editor changes. */
  onDidChangeRegions: vscode.Event<void>;
  /** An event that fires when the active region in the current active editor changes. */
  onDidChangeActiveRegion: vscode.Event<void>;
  /** An event that fires when the list of invalid markers in the current active editor changes. */
  onDidChangeInvalidMarkers: vscode.Event<void>;
  // #endregion
  // #endregion
  // #region Full Outline Store API
  // #region Getters
  getTopLevelFullOutlineItems(): FullTreeItem[];
  getActiveFullOutlineItem(): FullTreeItem | undefined;
  // #endregion
  // #region Events
  onDidChangeFullOutlineItems: vscode.Event<void>;
  onDidChangeActiveFullOutlineItem: vscode.Event<void>;
  // #endregion
  // #endregion
};

export function activate(context: vscode.ExtensionContext): RegionHelperAPI {
  console.log("Activating extension 'Region Helper'");

  const { subscriptions } = context;
  const regionStore = RegionStore.initialize(subscriptions);
  const documentSymbolStore = DocumentSymbolStore.initialize(subscriptions);
  const fullOutlineStore = FullOutlineStore.initialize(
    regionStore,
    documentSymbolStore,
    subscriptions
  );

  const regionTreeViewProvider = new RegionTreeViewProvider(regionStore, subscriptions);
  const treeView = vscode.window.createTreeView("regionHelperTreeView", {
    treeDataProvider: regionTreeViewProvider,
  });
  regionTreeViewProvider.setTreeView(treeView);
  subscriptions.push(treeView);

  const fullTreeViewProvider = new FullTreeViewProvider(fullOutlineStore, subscriptions);
  const fullTreeView = vscode.window.createTreeView("regionHelperFullTreeView", {
    treeDataProvider: fullTreeViewProvider,
  });
  fullTreeViewProvider.setTreeView(fullTreeView);
  subscriptions.push(fullTreeView);

  const regionDiagnosticsManager = new RegionDiagnosticsManager(regionStore, subscriptions);
  subscriptions.push(regionDiagnosticsManager.diagnostics);

  registerCommand(goToRegionTreeItemCommandId, goToRegionTreeItem);
  registerCommand(goToFullTreeItemCommandId, goToFullTreeItem);
  registerCommand(goToRegionBoundaryCommandId, () => goToRegionBoundary(regionStore));
  registerCommand(selectCurrentRegionCommandId, () => selectCurrentRegion(regionStore));
  registerCommand(goToRegionFromQuickPickCommandId, () => goToRegionFromQuickPick(regionStore));
  registerCommand(goToNextRegionCommandId, () => goToNextRegion(regionStore));
  registerCommand(goToPreviousRegionCommandId, () => goToPreviousRegion(regionStore));
  registerCommand(hideRegionsViewCommandId, hideRegionsView);
  registerCommand(showRegionsViewCommandId, showRegionsView);
  registerCommand(hideFullOutlineViewCommandId, hideFullOutlineView);
  registerCommand(showFullOutlineViewCommandId, showFullOutlineView);

  function registerCommand(
    commandId: string,
    callback: Parameters<typeof vscode.commands.registerCommand>[1]
  ): void {
    const command = vscode.commands.registerCommand(commandId, callback);
    subscriptions.push(command);
  }

  return {
    // #region Region Store API
    // #region Getters
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
    // #endregion
    // #region Events
    onDidChangeRegions: regionStore.onDidChangeRegions,
    onDidChangeActiveRegion: regionStore.onDidChangeActiveRegion,
    onDidChangeInvalidMarkers: regionStore.onDidChangeInvalidMarkers,
    // #endregion
    // #endregion
    // #region Full Outline Store API
    // #region Getters
    getTopLevelFullOutlineItems(): FullTreeItem[] {
      return fullOutlineStore.topLevelFullOutlineItems;
    },
    getActiveFullOutlineItem(): FullTreeItem | undefined {
      return fullOutlineStore.activeFullOutlineItem;
    },
    // #endregion
    // #region Events
    onDidChangeFullOutlineItems: fullOutlineStore.onDidChangeFullOutlineItems,
    onDidChangeActiveFullOutlineItem: fullOutlineStore.onDidChangeActiveFullOutlineItem,
    // #endregion
    // #endregion
  };
}

export function deactivate(): void {
  // Do nothing
}
