import * as vscode from "vscode";
import { fetchDocumentSymbolsAfterDelay } from "../../lib/fetchDocumentSymbols";
import { type RegionStore } from "../../state/RegionStore";
import { type FullTreeItem, getRegionFullTreeItem, getSymbolFullTreeItem } from "./FullTreeItem";
import { flattenFullTreeItems } from "./flattenFullTreeItems";
import { getActiveFullTreeItem } from "./getActiveFullTreeItem";
import { mergeRegionsAndSymbols } from "./mergeRegionAndSymbolTreeItems";

const MAX_NUM_DOCUMENT_SYMBOLS_FETCH_ATTEMPTS = 5;
const DOCUMENT_SYMBOLS_FETCH_DELAY_MS = 300;

export class FullTreeViewProvider implements vscode.TreeDataProvider<FullTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<FullTreeItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private treeView: vscode.TreeView<FullTreeItem> | undefined;
  private topLevelFullTreeItems: FullTreeItem[] = [];

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
      const activeTreeItem = getActiveFullTreeItem(this.topLevelFullTreeItems, cursorPosition);
      this.highlightActiveTreeItem(activeTreeItem);
    }
  }

  private highlightActiveTreeItem(activeTreeItem: FullTreeItem | undefined): void {
    if (!this.treeView || !activeTreeItem) {
      return;
    }
    this.treeView.reveal(activeTreeItem, { select: true, focus: false });
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
    return this.topLevelFullTreeItems;
  }

  private buildTree(documentSymbols: vscode.DocumentSymbol[]): void {
    const regionItems = this.regionStore.topLevelRegions.map((region) =>
      getRegionFullTreeItem(region)
    );
    const symbolItems = documentSymbols.map((symbol) => getSymbolFullTreeItem(symbol));
    const flattenedRegionItems = flattenFullTreeItems(regionItems);
    const flattenedSymbolItems = flattenFullTreeItems(symbolItems);
    const topLevelFullTreeItems = mergeRegionsAndSymbols({
      flattenedRegionItems,
      flattenedSymbolItems,
    });
    this.topLevelFullTreeItems = topLevelFullTreeItems;
  }

  setTreeView(treeView: vscode.TreeView<FullTreeItem>): void {
    this.treeView = treeView;
  }
}
