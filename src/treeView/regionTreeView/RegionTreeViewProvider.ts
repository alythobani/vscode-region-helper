import * as vscode from "vscode";
import { type Region } from "../../models/Region";
import { type RegionStore } from "../../state/RegionStore";
import { debounce } from "../../utils/debounce";
import { RegionTreeItem } from "./RegionTreeItem";

const DEBOUNCE_DELAY_MS = 300;

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
    this.regionStore.onDidChangeRegions(
      debounce(this.onRegionsChange.bind(this), DEBOUNCE_DELAY_MS),
      undefined,
      subscriptions
    );
  }

  private registerActiveRegionChangeListener(subscriptions: vscode.Disposable[]): void {
    this.regionStore.onDidChangeActiveRegion(
      debounce(this.onActiveRegionChange.bind(this), DEBOUNCE_DELAY_MS),
      undefined,
      subscriptions
    );
  }

  private onRegionsChange(): void {
    console.log("RegionTreeViewProvider: onRegionsChange");
    this._onDidChangeTreeData.fire(undefined);
  }

  private onActiveRegionChange(): void {
    console.log("RegionTreeViewProvider: onActiveRegionChange");
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
