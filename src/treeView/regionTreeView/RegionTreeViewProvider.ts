import * as vscode from "vscode";
import { getGlobalRegionsViewConfigValue } from "../../config/regionsViewConfig";
import { isCurrentActiveVersionedDocumentId } from "../../lib/getVersionedDocumentId";
import { type Region } from "../../models/Region";
import { type RegionStore } from "../../state/RegionStore";
import { debounce } from "../../utils/debounce";
import { RegionTreeItem } from "./RegionTreeItem";

const REFRESH_TREE_DEBOUNCE_DELAY_MS = 100;
const HIGHLIGHT_ACTIVE_REGION_DEBOUNCE_DELAY_MS = 100;

export class RegionTreeViewProvider implements vscode.TreeDataProvider<Region> {
  private _onDidChangeTreeData = new vscode.EventEmitter<undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private treeView: vscode.TreeView<Region> | undefined;

  private debouncedRefreshTree = debounce(
    this.refreshTree.bind(this),
    REFRESH_TREE_DEBOUNCE_DELAY_MS
  );

  private highlightActiveRegionTimeout: NodeJS.Timeout | undefined;

  constructor(private regionStore: RegionStore, subscriptions: vscode.Disposable[]) {
    this.registerListeners(subscriptions);
    this.debouncedHighlightActiveRegion();
  }

  private registerListeners(subscriptions: vscode.Disposable[]): void {
    vscode.window.onDidChangeActiveTextEditor(
      this.clearHighlightActiveRegionTimeoutIfExists.bind(this),
      this,
      subscriptions
    );
    vscode.workspace.onDidChangeTextDocument(this.onDocumentChange.bind(this), this, subscriptions);
    this.regionStore.onDidChangeRegions(this.debouncedRefreshTree, this, subscriptions);
    this.regionStore.onDidChangeActiveRegion(
      this.debouncedHighlightActiveRegion.bind(this),
      undefined,
      subscriptions
    );
  }

  private onDocumentChange(event: vscode.TextDocumentChangeEvent): void {
    // Cancel any existing timeout to highlight the active region; we can wait for the upcoming
    // update from RegionStore to refresh the up-to-date active region.
    if (event.document === vscode.window.activeTextEditor?.document) {
      this.clearHighlightActiveRegionTimeoutIfExists();
    }
  }

  private refreshTree(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  private debouncedHighlightActiveRegion(): void {
    this.clearHighlightActiveRegionTimeoutIfExists();
    this.highlightActiveRegionTimeout = setTimeout(
      this.highlightActiveRegion.bind(this),
      HIGHLIGHT_ACTIVE_REGION_DEBOUNCE_DELAY_MS
    );
  }

  private clearHighlightActiveRegionTimeoutIfExists(): void {
    if (this.highlightActiveRegionTimeout) {
      clearTimeout(this.highlightActiveRegionTimeout);
      this.highlightActiveRegionTimeout = undefined;
    }
  }

  private highlightActiveRegion(): void {
    this.clearHighlightActiveRegionTimeoutIfExists();
    const shouldHighlightActiveRegion = getGlobalRegionsViewConfigValue(
      "shouldAutoHighlightActiveRegion"
    );
    if (!shouldHighlightActiveRegion) {
      return;
    }
    const { activeRegion, versionedDocumentId } = this.regionStore;
    if (!this.treeView || !activeRegion) {
      return;
    }
    if (!isCurrentActiveVersionedDocumentId(versionedDocumentId)) {
      // The active region is from an old document version. We'll highlight the active region once
      // RegionStore fires events for the new document version.
      return;
    }
    this.treeView.reveal(activeRegion, { select: true, focus: false });
  }

  getTreeItem(region: Region): vscode.TreeItem {
    return new RegionTreeItem(region);
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

  setTreeView(treeView: vscode.TreeView<Region>): void {
    this.treeView = treeView;
  }
}
