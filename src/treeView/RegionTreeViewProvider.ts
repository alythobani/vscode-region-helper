import * as vscode from "vscode";
import { getCursorActiveRegion } from "../lib/getCursorActiveRegion";
import { type Region } from "../models/Region";
import { type RegionStore } from "../state/RegionStore";
import { RegionTreeItem } from "./RegionTreeItem";

export class RegionTreeViewProvider implements vscode.TreeDataProvider<Region> {
  private _onDidChangeTreeData = new vscode.EventEmitter<undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private treeView: vscode.TreeView<Region> | undefined;

  constructor(private regionStore: RegionStore) {
    this.registerListeners();
  }

  private registerListeners(): void {
    this.registerRegionsChangeListener();
    this.registerSelectionChangeListener();
  }

  private registerRegionsChangeListener(): void {
    this.regionStore.onDidChangeRegions(() => this.onRegionsChange());
  }

  private registerSelectionChangeListener(): void {
    vscode.window.onDidChangeTextEditorSelection((event) => {
      if (event.textEditor === vscode.window.activeTextEditor) {
        this.highlightActiveRegion();
      }
    });
  }

  onRegionsChange(): void {
    this._onDidChangeTreeData.fire(undefined);
    this.highlightActiveRegion();
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
