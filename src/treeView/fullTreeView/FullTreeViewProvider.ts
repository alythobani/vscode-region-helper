import * as vscode from "vscode";
import { fetchDocumentSymbolsAfterDelay } from "../../lib/fetchDocumentSymbols";
import { type RegionStore } from "../../state/RegionStore";
import { type FullTreeItem, getRegionFullTreeItem, getSymbolFullTreeItem } from "./FullTreeItem";
import { flattenFullTreeItems } from "./flattenFullTreeItems";
import { generateTopLevelFullTreeItems } from "./generateTopLevelFullTreeItems";
import { getActiveFullTreeItem } from "./getActiveFullTreeItem";

const MAX_NUM_DOCUMENT_SYMBOLS_FETCH_ATTEMPTS = 5;
const DOCUMENT_SYMBOLS_FETCH_DELAY_MS = 300;

export class FullTreeViewProvider implements vscode.TreeDataProvider<FullTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<FullTreeItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private treeView: vscode.TreeView<FullTreeItem> | undefined;

  private _topLevelFullTreeItems: FullTreeItem[] = [];
  private _activeFullTreeItem: FullTreeItem | undefined = undefined;

  constructor(private regionStore: RegionStore, subscriptions: vscode.Disposable[]) {
    this.registerListeners(subscriptions);
    if (vscode.window.activeTextEditor?.document) {
      void this.updateSymbols(vscode.window.activeTextEditor.document);
    }
  }

  private registerListeners(subscriptions: vscode.Disposable[]): void {
    vscode.window.onDidChangeActiveTextEditor(
      (editor) => {
        if (editor?.document) {
          void this.updateSymbols(editor.document);
        }
      },
      this,
      subscriptions
    );
    vscode.workspace.onDidChangeTextDocument(
      (event) => {
        if (vscode.window.activeTextEditor?.document === event.document) {
          void this.updateSymbols(event.document);
        }
      },
      this,
      subscriptions
    );
    this.regionStore.onDidChangeRegions(() => this.onRegionsChange(), undefined, subscriptions);
    this.registerSelectionChangeListener(subscriptions);
  }

  private onRegionsChange(): void {
    this.refreshTree();
  }

  private registerSelectionChangeListener(subscriptions: vscode.Disposable[]): void {
    vscode.window.onDidChangeTextEditorSelection(
      (event) => this.onSelectionChange(event),
      undefined,
      subscriptions
    );
  }

  private onSelectionChange(event: vscode.TextEditorSelectionChangeEvent): void {
    if (event.textEditor === vscode.window.activeTextEditor) {
      const cursorPosition = event.textEditor.selection.active;
      const activeFullTreeItem = getActiveFullTreeItem(this._topLevelFullTreeItems, cursorPosition);
      if (activeFullTreeItem === this._activeFullTreeItem) {
        // No need to update the tree if the active tree item hasn't changed.
        return;
      }
      this._activeFullTreeItem = activeFullTreeItem;
      this.highlightActiveTreeItem();
    }
  }

  private highlightActiveTreeItem(): void {
    if (!this.treeView || !this._activeFullTreeItem) {
      return;
    }
    this.treeView.reveal(this._activeFullTreeItem, { select: true, focus: false });
  }

  private async updateSymbols(document: vscode.TextDocument, attemptIdx = 0): Promise<void> {
    if (attemptIdx >= MAX_NUM_DOCUMENT_SYMBOLS_FETCH_ATTEMPTS) {
      // console.warn(`Failed to fetch document symbols after ${attemptIdx} attempts. Giving up.`);
      return;
    }
    try {
      const fetchedDocumentSymbols = await fetchDocumentSymbolsAfterDelay(
        document,
        DOCUMENT_SYMBOLS_FETCH_DELAY_MS
      );
      if (fetchedDocumentSymbols === undefined) {
        void this.updateSymbols(document, attemptIdx + 1);
        return;
      }
      this.buildTree(fetchedDocumentSymbols);
      this.refreshTree();
    } catch (_error) {
      // console.error("Error fetching document symbols:", error);
    }
  }

  private refreshTree(): void {
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

  private buildTree(documentSymbols: vscode.DocumentSymbol[]): void {
    const regionItems = this.regionStore.topLevelRegions.map((region) =>
      getRegionFullTreeItem(region)
    );
    const symbolItems = documentSymbols.map((symbol) => getSymbolFullTreeItem(symbol));
    const flattenedRegionItems = flattenFullTreeItems(regionItems);
    const flattenedSymbolItems = flattenFullTreeItems(symbolItems);
    const topLevelFullTreeItems = generateTopLevelFullTreeItems({
      flattenedRegionItems,
      flattenedSymbolItems,
    });
    this._topLevelFullTreeItems = topLevelFullTreeItems;
  }

  setTreeView(treeView: vscode.TreeView<FullTreeItem>): void {
    this.treeView = treeView;
  }
}
