import * as vscode from "vscode";
import { type RegionHelperAPI } from "./api/regionHelperAPI";
import { registerAllCommands } from "./commands/registerCommand";
import { RegionDiagnosticsManager } from "./diagnostics/RegionDiagnosticsManager";
import { type FlattenedRegion } from "./lib/flattenRegions";
import { type InvalidMarker } from "./lib/parseAllRegions";
import { type Region } from "./models/Region";
import { CollapsibleStateManager } from "./state/CollapsibleStateManager";
import { DocumentSymbolStore } from "./state/DocumentSymbolStore";
import { FullOutlineStore } from "./state/FullOutlineStore";
import { RegionStore } from "./state/RegionStore";
import { type FullTreeItem } from "./treeView/fullTreeView/FullTreeItem";
import { FullTreeViewProvider } from "./treeView/fullTreeView/FullTreeViewProvider";
import { RegionTreeViewProvider } from "./treeView/regionTreeView/RegionTreeViewProvider";

export function activate(context: vscode.ExtensionContext): RegionHelperAPI {
  const { subscriptions, workspaceState } = context;
  const regionCollapsibleStateManager = new CollapsibleStateManager(
    workspaceState,
    "regionsViewCollapsibleStateStoreByDocumentId"
  );
  const fullOutlineCollapsibleStateManager = new CollapsibleStateManager(
    workspaceState,
    "fullOutlineViewCollapsibleStateStoreByDocumentId"
  );

  const regionStore = RegionStore.initialize(subscriptions);
  const documentSymbolStore = DocumentSymbolStore.initialize(subscriptions);
  const fullOutlineStore = FullOutlineStore.initialize(
    regionStore,
    documentSymbolStore,
    fullOutlineCollapsibleStateManager,
    subscriptions
  );

  const regionTreeViewProvider = new RegionTreeViewProvider(
    regionStore,
    regionCollapsibleStateManager,
    subscriptions
  );
  const regionTreeView = vscode.window.createTreeView("regionHelperRegionsView", {
    treeDataProvider: regionTreeViewProvider,
    showCollapseAll: true,
  });
  regionTreeViewProvider.setTreeView(regionTreeView);
  subscriptions.push(regionTreeView);

  const fullTreeViewProvider = new FullTreeViewProvider(
    fullOutlineStore,
    fullOutlineCollapsibleStateManager,
    subscriptions
  );
  const fullTreeView = vscode.window.createTreeView("regionHelperFullTreeView", {
    treeDataProvider: fullTreeViewProvider,
    showCollapseAll: true,
  });
  fullTreeViewProvider.setTreeView(fullTreeView);
  subscriptions.push(fullTreeView);

  const regionDiagnosticsManager = new RegionDiagnosticsManager(regionStore, subscriptions);
  subscriptions.push(regionDiagnosticsManager.diagnostics);

  registerAllCommands(subscriptions, { regionStore, regionTreeViewProvider, fullTreeViewProvider });

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
