import * as vscode from "vscode";
import { type Region } from "../models/Region";
import { type RegionStore } from "../state/RegionStore";
import { getCursorActiveRegion } from "../utils/getCursorActiveRegion";
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
    this.registerSelectionChangeListener(subscriptions);
  }

  private registerRegionsChangeListener(subscriptions: vscode.Disposable[]): void {
    this.regionStore.onDidChangeRegions(() => this.onRegionsChange(), undefined, subscriptions);
  }

  private registerSelectionChangeListener(subscriptions: vscode.Disposable[]): void {
    vscode.window.onDidChangeTextEditorSelection(
      (event) => this.onSelectionChange(event),
      undefined,
      subscriptions
    );
  }

  private onRegionsChange(): void {
    this._onDidChangeTreeData.fire(undefined);
    this.highlightActiveRegion();
  }

  private onSelectionChange(event: vscode.TextEditorSelectionChangeEvent): void {
    if (event.textEditor === vscode.window.activeTextEditor) {
      this.highlightActiveRegion();
    }
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

  private highlightActiveRegion(): void {
    if (!this.treeView || !vscode.window.activeTextEditor) {
      return;
    }
    const cursorLine = vscode.window.activeTextEditor.selection.active.line;
    const activeRegion = getCursorActiveRegion(this.regionStore.topLevelRegions, cursorLine);
    if (!activeRegion) {
      return;
    }
    this.treeView.reveal(activeRegion, { select: true, focus: false });
  }
}
