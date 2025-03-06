import * as vscode from "vscode";
import { isCurrentActiveVersionedDocumentId } from "../../lib/getVersionedDocumentId";
import { type Region } from "../../models/Region";
import { type RegionStore } from "../../state/RegionStore";
import { RegionTreeItem } from "./RegionTreeItem";

const HIGHLIGHT_ACTIVE_REGION_DEBOUNCE_DELAY_MS = 1;

export class RegionTreeViewProvider implements vscode.TreeDataProvider<Region> {
  private _onDidChangeTreeData = new vscode.EventEmitter<undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private treeView: vscode.TreeView<Region> | undefined;

  private highlightActiveRegionTimeout: NodeJS.Timeout | undefined;

  constructor(private regionStore: RegionStore, subscriptions: vscode.Disposable[]) {
    this.registerListeners(subscriptions);
    this.debouncedHighlightActiveRegion();
  }

  private registerListeners(subscriptions: vscode.Disposable[]): void {
    this.registerDocumentChangeListener(subscriptions);
    this.registerRegionsChangeListener(subscriptions);
    this.registerActiveRegionChangeListener(subscriptions);
  }

  private registerDocumentChangeListener(subscriptions: vscode.Disposable[]): void {
    vscode.workspace.onDidChangeTextDocument(this.onDocumentChange.bind(this), this, subscriptions);
  }

  private onDocumentChange(event: vscode.TextDocumentChangeEvent): void {
    // Cancel any existing timeout to highlight the active region. Now that the document has changed,
    // the existing highlight call may no longer be valid for the current document region tree.
    // RegionStore will soon refresh the regions and active region, at which point we'll highlight
    // the new active region if needed.
    if (event.document === vscode.window.activeTextEditor?.document) {
      this.clearHighlightActiveRegionTimeoutIfExists();
    }
  }

  private registerRegionsChangeListener(subscriptions: vscode.Disposable[]): void {
    // Note: no need to debounce here since `onDidChangeRegions` is already debounced by RegionStore
    // (but if that ever changes, we should debounce here as well)
    this.regionStore.onDidChangeRegions(this.onRegionsChange.bind(this), undefined, subscriptions);
  }

  private registerActiveRegionChangeListener(subscriptions: vscode.Disposable[]): void {
    this.regionStore.onDidChangeActiveRegion(
      // Note: no need to debounce here since `onDidChangeActiveRegion` is already debounced by
      // RegionStore (but if that ever changes, we should debounce here as well)
      this.onActiveRegionChange.bind(this),
      undefined,
      subscriptions
    );
  }

  private onRegionsChange(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  private onActiveRegionChange(): void {
    this.debouncedHighlightActiveRegion();
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
