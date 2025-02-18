import * as vscode from "vscode";
import { type Region } from "../models/Region";
import { type RegionStore } from "../state/RegionStore";
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
    this.regionStore.onDidChangeRegions(() => this.onRegionsChange(), undefined, subscriptions);
  }

  private registerActiveRegionChangeListener(subscriptions: vscode.Disposable[]): void {
    this.regionStore.onDidChangeActiveRegion(
      () => this.onActiveRegionChange(),
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
    const { currentActiveRegion } = this.regionStore;
    if (!this.treeView || !currentActiveRegion) {
      return;
    }
    this.treeView.reveal(currentActiveRegion, { select: true, focus: false });
  }

  getTreeItem(region: Region): vscode.TreeItem {
    return new RegionTreeItem(region);
  }

  getParent(element: Region): vscode.ProviderResult<Region> {
    return element.parent;
  }

  getChildren(element?: Region): Region[] {
    return element ? element.children : this.regionStore.topLevelRegions;
  }

  setTreeView(treeView: vscode.TreeView<Region>): void {
    this.treeView = treeView;
  }
}
