import * as vscode from "vscode";
import { getGlobalRegionsViewConfigValue } from "../../config/regionsViewConfig";
import { isCurrentActiveVersionedDocumentId } from "../../lib/getVersionedDocumentId";
import { type Region } from "../../models/Region";
import { type CollapsibleStateManager } from "../../state/CollapsibleStateManager";
import { type RegionStore } from "../../state/RegionStore";
import { debounce } from "../../utils/debounce";
import { RegionTreeItem } from "./RegionTreeItem";

const REFRESH_TREE_DEBOUNCE_DELAY_MS = 100;
const AUTO_HIGHLIGHT_ACTIVE_REGION_DEBOUNCE_DELAY_MS = 100;

export class RegionTreeViewProvider implements vscode.TreeDataProvider<Region> {
  private _onDidChangeTreeData = new vscode.EventEmitter<undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private treeView: vscode.TreeView<Region> | undefined;

  private debouncedRefreshTree = debounce(
    this.refreshTree.bind(this),
    REFRESH_TREE_DEBOUNCE_DELAY_MS
  );

  private autoHighlightActiveRegionTimeout: NodeJS.Timeout | undefined;

  constructor(
    private regionStore: RegionStore,
    private collapsibleStateManager: CollapsibleStateManager,
    subscriptions: vscode.Disposable[]
  ) {
    this.registerListeners(subscriptions);
    this.debouncedAutoHighlightActiveRegion();
  }

  private registerListeners(subscriptions: vscode.Disposable[]): void {
    vscode.window.onDidChangeActiveTextEditor(
      this.clearAutoHighlightActiveRegionTimeoutIfExists.bind(this),
      this,
      subscriptions
    );
    vscode.workspace.onDidChangeTextDocument(this.onDocumentChange.bind(this), this, subscriptions);
    this.regionStore.onDidChangeRegions(this.debouncedRefreshTree, this, subscriptions);
    this.regionStore.onDidChangeActiveRegion(
      this.debouncedAutoHighlightActiveRegion.bind(this),
      undefined,
      subscriptions
    );
  }

  private onDocumentChange(event: vscode.TextDocumentChangeEvent): void {
    // Cancel any existing timeout to highlight the active region; we can wait for the upcoming
    // update from RegionStore to refresh the up-to-date active region.
    if (event.document === vscode.window.activeTextEditor?.document) {
      this.clearAutoHighlightActiveRegionTimeoutIfExists();
    }
  }

  private refreshTree(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  // #region Highlighting active region
  private debouncedAutoHighlightActiveRegion(): void {
    this.clearAutoHighlightActiveRegionTimeoutIfExists();
    this.autoHighlightActiveRegionTimeout = setTimeout(
      this.autoHighlightActiveRegion.bind(this),
      AUTO_HIGHLIGHT_ACTIVE_REGION_DEBOUNCE_DELAY_MS
    );
  }

  private clearAutoHighlightActiveRegionTimeoutIfExists(): void {
    if (this.autoHighlightActiveRegionTimeout) {
      clearTimeout(this.autoHighlightActiveRegionTimeout);
      this.autoHighlightActiveRegionTimeout = undefined;
    }
  }

  private autoHighlightActiveRegion(): void {
    this.clearAutoHighlightActiveRegionTimeoutIfExists();
    const shouldAutoHighlightActiveRegion = getGlobalRegionsViewConfigValue(
      "shouldAutoHighlightActiveRegion"
    );
    if (!shouldAutoHighlightActiveRegion) {
      return;
    }
    if (!isCurrentActiveVersionedDocumentId(this.regionStore.versionedDocumentId)) {
      // The active region is from an old document version. We'll auto-highlight the active region
      // once RegionStore fires events for the new document version.
      return;
    }
    this.highlightActiveRegion();
  }

  private highlightActiveRegion(): void {
    const { activeRegion } = this.regionStore;
    if (!this.treeView || !activeRegion) {
      return;
    }
    this.treeView.reveal(activeRegion, { select: true, focus: false });
  }
  // #endregion

  // #region Required TreeDataProvider methods
  getTreeItem(region: Region): vscode.TreeItem {
    const initialCollapsibleState = this.getInitialCollapsibleState(region);
    return new RegionTreeItem(region, initialCollapsibleState);
  }

  getInitialCollapsibleState(region: Region): vscode.TreeItemCollapsibleState {
    if (region.children.length === 0) {
      return vscode.TreeItemCollapsibleState.None;
    }
    const savedCollapsibleState = this.collapsibleStateManager.getSavedCollapsibleState({
      documentId: this.regionStore.documentId,
      itemId: region.id,
    });
    return savedCollapsibleState ?? vscode.TreeItemCollapsibleState.Expanded;
  }

  getParent(element: Region): vscode.ProviderResult<Region> {
    const { parent } = element;
    if (!parent || parent.wasClosed) {
      return undefined;
    }
    return parent;
  }

  getChildren(element?: Region): Region[] {
    return element ? element.children : this.regionStore.topLevelRegions;
  }
  // #endregion

  /**
   * Sets the tree view for this provider and registers event listeners for expand/collapse events.
   * To be called after the tree view is created (which requires the provider to be created first,
   * hence why this can't go in the constructor).
   */
  setTreeView(treeView: vscode.TreeView<Region>): void {
    this.treeView = treeView;
    treeView.onDidCollapseElement((event) => {
      const { id: itemId } = event.element;
      const { documentId, allParentIds } = this.regionStore;
      this.collapsibleStateManager.onCollapseTreeItem({ itemId, documentId, allParentIds });
    });
    treeView.onDidExpandElement((event) => {
      const { id: itemId } = event.element;
      const { documentId, allParentIds } = this.regionStore;
      this.collapsibleStateManager.onExpandTreeItem({ itemId, documentId, allParentIds });
    });
  }

  expandAllTreeItems(): void {
    if (!this.treeView) {
      return;
    }
    this.collapsibleStateManager.onExpandAllTreeItems({ documentId: this.regionStore.documentId });
    for (const topLevelRegion of this.regionStore.topLevelRegions) {
      this.treeView.reveal(topLevelRegion, {
        select: false,
        focus: false,
        expand: 3, // Max depth
      });
    }
    // Finish by highlighting the cursor's active region. We do this regardless of the
    // `shouldAutoHighlightActiveRegion` setting, since the view is open anyway when/after calling
    // Expand All, so there's no harm in revealing. This helps re-orient instead of scroll position
    // being reset to the top of the tree view.
    this.highlightActiveRegion(); // TODO: call with expand: 3
  }
}
