import * as vscode from "vscode";
import { type DocumentSymbolStore } from "../../state/DocumentSymbolStore";
import { type RegionStore } from "../../state/RegionStore";
import { debounce } from "../../utils/debounce";
import { type FullTreeItem, getRegionFullTreeItem, getSymbolFullTreeItem } from "./FullTreeItem";
import { flattenFullTreeItems } from "./flattenFullTreeItems";
import { generateTopLevelFullTreeItems } from "./generateTopLevelFullTreeItems";
import { getActiveFullTreeItem } from "./getActiveFullTreeItem";

const DEBOUNCE_DELAY_MS = 300;

export class FullTreeViewProvider implements vscode.TreeDataProvider<FullTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<FullTreeItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private treeView: vscode.TreeView<FullTreeItem> | undefined;

  private _topLevelFullTreeItems: FullTreeItem[] = [];
  private _activeFullTreeItem: FullTreeItem | undefined = undefined;

  constructor(
    private regionStore: RegionStore,
    private documentSymbolStore: DocumentSymbolStore,
    subscriptions: vscode.Disposable[]
  ) {
    this.registerListeners(subscriptions);
    this.buildAndRefreshTree();
  }

  private registerListeners(subscriptions: vscode.Disposable[]): void {
    this.regionStore.onDidChangeRegions(
      debounce(this.onRegionsChange.bind(this), DEBOUNCE_DELAY_MS),
      this,
      subscriptions
    );
    this.documentSymbolStore.onDidChangeDocumentSymbols(
      debounce(this.onDocumentSymbolsChange.bind(this), DEBOUNCE_DELAY_MS),
      this,
      subscriptions
    );
    this.registerSelectionChangeListener(subscriptions);
  }

  private onRegionsChange(): void {
    console.log("FullTreeViewProvider: onRegionsChange");
    this.buildAndRefreshTree();
  }

  private onDocumentSymbolsChange(): void {
    console.log("FullTreeViewProvider: onDocumentSymbolsChange");
    this.buildAndRefreshTree();
  }

  private registerSelectionChangeListener(subscriptions: vscode.Disposable[]): void {
    vscode.window.onDidChangeTextEditorSelection(
      debounce(this.onSelectionChange.bind(this), DEBOUNCE_DELAY_MS),
      this,
      subscriptions
    );
  }

  private onSelectionChange(event: vscode.TextEditorSelectionChangeEvent): void {
    if (event.textEditor === vscode.window.activeTextEditor) {
      this.refreshAndHighlightActiveTreeItem();
    }
  }

  private refreshAndHighlightActiveTreeItem(): void {
    const didActiveTreeItemChange = this.refreshActiveTreeItem();
    if (didActiveTreeItemChange) {
      this.highlightActiveTreeItem();
    }
  }

  /** Returns true if the active tree item changed, false otherwise. */
  private refreshActiveTreeItem(): boolean {
    const cursorPosition = vscode.window.activeTextEditor?.selection.active;
    if (!cursorPosition) {
      return false;
    }
    const oldActiveFullTreeItem = this._activeFullTreeItem;
    this._activeFullTreeItem = getActiveFullTreeItem(this._topLevelFullTreeItems, cursorPosition);
    return this._activeFullTreeItem !== oldActiveFullTreeItem;
  }

  private highlightActiveTreeItem(): void {
    if (!this.treeView || !this._activeFullTreeItem) {
      // Unfortunately VSCode's API doesn't provide a way to deselect a tree item
      return;
    }
    console.log(
      `FullTreeViewProvider: Highlighting active tree item ${this._activeFullTreeItem.label}`
    );
    this.treeView.reveal(this._activeFullTreeItem, { select: true, focus: false });
  }

  private buildAndRefreshTree(): void {
    this.buildTree();
    this.refreshTree();
    this.refreshAndHighlightActiveTreeItem();
  }

  private refreshTree(): void {
    console.log("FullTreeViewProvider: Firing onDidChangeTreeData");
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: FullTreeItem): vscode.TreeItem {
    return element;
  }

  getParent(element: FullTreeItem): FullTreeItem | undefined {
    return element.parent;
  }

  getChildren(element?: FullTreeItem): FullTreeItem[] {
    if (element) {
      return element.children;
    }
    return this._topLevelFullTreeItems;
  }

  private buildTree(): void {
    console.log("FullTreeViewProvider: Building tree...");
    const startTime = performance.now();
    const regionFullTreeItems = this.regionStore.topLevelRegions.map((region) =>
      getRegionFullTreeItem(region)
    );
    const symbolFullTreeItems =
      this.documentSymbolStore.documentSymbols?.map((symbol) => getSymbolFullTreeItem(symbol)) ??
      [];
    const flattenedRegionItems = flattenFullTreeItems(regionFullTreeItems);
    const flattenedSymbolItems = flattenFullTreeItems(symbolFullTreeItems);
    const topLevelFullTreeItems = generateTopLevelFullTreeItems({
      flattenedRegionItems,
      flattenedSymbolItems,
    });
    this._topLevelFullTreeItems = topLevelFullTreeItems;
    const endTime = performance.now();
    console.log(
      `FullTreeViewProvider: Building tree with ${
        topLevelFullTreeItems.length
      } top-level items took ${endTime - startTime} ms.`
    );
  }

  setTreeView(treeView: vscode.TreeView<FullTreeItem>): void {
    this.treeView = treeView;
  }
}
