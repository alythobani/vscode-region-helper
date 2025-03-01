import * as vscode from "vscode";
import { fetchDocumentSymbolsAfterDelay } from "../../lib/fetchDocumentSymbols";
import { type RegionStore } from "../../state/RegionStore";
import { type FullTreeItem, getRegionFullTreeItem, getSymbolFullTreeItem } from "./FullTreeItem";
import { flattenFullTreeItems } from "./flattenFullTreeItems";
import { mergeRegionsAndSymbols } from "./mergeRegionAndSymbolTreeItems";

const MAX_NUM_DOCUMENT_SYMBOLS_FETCH_ATTEMPTS = 5;
const DOCUMENT_SYMBOLS_FETCH_DELAY_MS = 300;

export class FullTreeViewProvider implements vscode.TreeDataProvider<FullTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<FullTreeItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private treeView: vscode.TreeView<FullTreeItem> | undefined;
  private documentSymbols: vscode.DocumentSymbol[] = [];

  constructor(private regionStore: RegionStore, subscriptions: vscode.Disposable[]) {
    console.log("FullTreeViewProvider constructor");
    this.registerListeners(subscriptions);
    if (vscode.window.activeTextEditor?.document) {
      void this.updateSymbols(vscode.window.activeTextEditor.document);
    }
  }

  private registerListeners(subscriptions: vscode.Disposable[]): void {
    vscode.window.onDidChangeActiveTextEditor(
      (editor) => {
        if (editor?.document) {
          console.log("Active editor changed");
          void this.updateSymbols(editor.document);
        }
      },
      this,
      subscriptions
    );
    vscode.workspace.onDidChangeTextDocument(
      (event) => {
        if (vscode.window.activeTextEditor?.document === event.document) {
          console.log("Document changed");
          void this.updateSymbols(event.document);
        }
      },
      this,
      subscriptions
    );

    this.regionStore.onDidChangeRegions(() => this.onRegionsChange(), undefined, subscriptions);
  }

  private onRegionsChange(): void {
    console.log("Regions changed");
    this.refreshTree();
  }

  private async updateSymbols(document: vscode.TextDocument, attemptIdx = 0): Promise<void> {
    if (attemptIdx >= MAX_NUM_DOCUMENT_SYMBOLS_FETCH_ATTEMPTS) {
      console.warn(`Failed to fetch document symbols after ${attemptIdx} attempts. Giving up.`);
      return;
    }
    try {
      const fetchedDocumentSymbols = await fetchDocumentSymbolsAfterDelay(
        document,
        DOCUMENT_SYMBOLS_FETCH_DELAY_MS
      );
      if (fetchedDocumentSymbols === undefined) {
        console.log("Failed to fetch document symbols. Retrying...");
        void this.updateSymbols(document, attemptIdx + 1);
        return;
      }
      console.log("Fetched document symbols:", fetchedDocumentSymbols);
      this.documentSymbols = fetchedDocumentSymbols;
      this.refreshTree();
    } catch (error) {
      console.error("Error fetching document symbols:", error);
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
    return this.buildTree();
  }

  private buildTree(): FullTreeItem[] {
    console.log("Building tree");
    const regionItems = this.regionStore.topLevelRegions.map((region) =>
      getRegionFullTreeItem(region)
    );
    console.log("Region items:", regionItems);
    const symbolItems = this.documentSymbols.map((symbol) => getSymbolFullTreeItem(symbol));
    console.log("Symbol items:", symbolItems);
    const flattenedRegionItems = flattenFullTreeItems(regionItems);
    const flattenedSymbolItems = flattenFullTreeItems(symbolItems);
    return mergeRegionsAndSymbols({ flattenedRegionItems, flattenedSymbolItems });
  }

  setTreeView(treeView: vscode.TreeView<FullTreeItem>): void {
    this.treeView = treeView;
  }
}
