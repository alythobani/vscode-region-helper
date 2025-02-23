import * as vscode from "vscode";
import { fetchDocumentSymbolsAfterDelay } from "../lib/fetchDocumentSymbols";
import { type Region } from "../models/Region";
import { type RegionStore } from "../state/RegionStore";
import { FullTreeItem } from "./FullTreeItem";

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
      this.convertRegionToTreeItem(region, undefined)
    );
    console.log("Region items:", regionItems);
    const symbolItems = this.documentSymbols.map((symbol) =>
      this.convertSymbolToTreeItem(symbol, undefined)
    );
    console.log("Symbol items:", symbolItems);
    const flattenedRegions = this.flattenRegions(this.regionStore.topLevelRegions, undefined);
    const flattenedSymbols = this.flattenSymbols(this.documentSymbols, undefined);
    return this.mergeRegionsAndSymbols(flattenedRegions, flattenedSymbols);
  }

  private flattenRegions(regions: Region[], parent: FullTreeItem | undefined): FullTreeItem[] {
    return regions.flatMap((region) => {
      const item = this.convertRegionToTreeItem(region, parent);
      return [item, ...this.flattenRegions(region.children, item)];
    });
  }

  private flattenSymbols(
    symbols: vscode.DocumentSymbol[],
    parent: FullTreeItem | undefined
  ): FullTreeItem[] {
    return symbols.flatMap((symbol) => {
      const item = this.convertSymbolToTreeItem(symbol, parent);
      return [item, ...this.flattenSymbols(symbol.children, item)];
    });
  }

  private mergeRegionsAndSymbols(regions: FullTreeItem[], symbols: FullTreeItem[]): FullTreeItem[] {
    const merged: FullTreeItem[] = [];
    const allItems = [...regions, ...symbols];

    // Sort by start position (line first, then character)
    allItems.sort((a, b) => {
      if (a.range.start.line !== b.range.start.line) {
        return a.range.start.line - b.range.start.line;
      }
      return a.range.start.character - b.range.start.character;
    });

    const stack: FullTreeItem[] = [];

    for (const item of allItems) {
      let lastInStack = stack[stack.length - 1];
      while (lastInStack !== undefined && !lastInStack.range.contains(item.range)) {
        stack.pop();
        lastInStack = stack[stack.length - 1];
      }

      if (lastInStack !== undefined) {
        lastInStack.children.push(item);
        item.parent = stack[stack.length - 1];
      } else {
        merged.push(item);
      }

      stack.push(item);
    }

    return merged;
  }

  private convertRegionToTreeItem(region: Region, parent: FullTreeItem | undefined): FullTreeItem {
    const item = new FullTreeItem(
      region.name ?? "Unnamed region",
      new vscode.Range(region.startLineIdx, 0, region.endLineIdx, 0),
      "region",
      parent,
      region.children.map((child) => this.convertRegionToTreeItem(child, parent)),
      new vscode.ThemeIcon("symbol-namespace")
    );
    return item;
  }

  private convertSymbolToTreeItem(
    symbol: vscode.DocumentSymbol,
    parent: FullTreeItem | undefined
  ): FullTreeItem {
    const item = new FullTreeItem(
      symbol.name,
      symbol.range,
      "symbol",
      parent,
      symbol.children.map((child) => this.convertSymbolToTreeItem(child, parent)),
      new vscode.ThemeIcon("symbol-" + vscode.SymbolKind[symbol.kind].toLowerCase())
    );
    return item;
  }

  setTreeView(treeView: vscode.TreeView<FullTreeItem>): void {
    this.treeView = treeView;
  }
}
