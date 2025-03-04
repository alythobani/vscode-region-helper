import * as vscode from "vscode";
import { type Region } from "../../models/Region";
import { type RegionStore } from "../../state/RegionStore";
import { RegionTreeItem } from "./RegionTreeItem";

export class RegionTreeViewProvider implements vscode.TreeDataProvider<Region> {
  private _onDidChangeTreeData = new vscode.EventEmitter<undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private treeView: vscode.TreeView<Region> | undefined;

  constructor(private regionStore: RegionStore, subscriptions: vscode.Disposable[]) {
    this.registerListeners(subscriptions);
  }

  private registerListeners(subscriptions: vscode.Disposable[]): void {
    this.registerRegionsChangeListener(subscriptions);
    this.registerActiveRegionChangeListener(subscriptions);
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
    this.highlightActiveRegion();
  }

  private highlightActiveRegion(): void {
    const { activeRegion } = this.regionStore;
    if (!this.treeView || !activeRegion) {
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
