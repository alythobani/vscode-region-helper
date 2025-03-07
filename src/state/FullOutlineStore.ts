import * as vscode from "vscode";
import {
  type FullTreeItem,
  getFlattenedRegionFullTreeItem,
  getFlattenedSymbolFullTreeItem,
} from "../treeView/fullTreeView/FullTreeItem";
import { generateTopLevelFullTreeItems } from "../treeView/fullTreeView/generateTopLevelFullTreeItems";
import { getActiveFullTreeItem } from "../treeView/fullTreeView/getActiveFullTreeItem";
import { debounce } from "../utils/debounce";
import { type DocumentSymbolStore } from "./DocumentSymbolStore";
import { type RegionStore } from "./RegionStore";

const REFRESH_FULL_OUTLINE_DEBOUNCE_DELAY_MS = 300;
const REFRESH_ACTIVE_ITEM_DEBOUNCE_DELAY_MS = 100;

export class FullOutlineStore {
  private static _instance: FullOutlineStore | undefined = undefined;

  static initialize(
    regionStore: RegionStore,
    documentSymbolStore: DocumentSymbolStore,
    subscriptions: vscode.Disposable[]
  ): FullOutlineStore {
    if (this._instance) {
      throw new Error("FullOutlineStore is already initialized! Only one instance is allowed.");
    }
    this._instance = new FullOutlineStore(regionStore, documentSymbolStore, subscriptions);
    return this._instance;
  }

  static getInstance(): FullOutlineStore {
    if (!this._instance) {
      throw new Error("FullOutlineStore is not initialized! Call `initialize()` first.");
    }
    return this._instance;
  }

  private _topLevelItems: FullTreeItem[] = [];
  private _onDidChangeFullOutlineItems = new vscode.EventEmitter<void>();
  readonly onDidChangeFullOutlineItems = this._onDidChangeFullOutlineItems.event;
  get topLevelFullOutlineItems(): FullTreeItem[] {
    return this._topLevelItems;
  }

  private _activeItem: FullTreeItem | undefined = undefined;
  private _onDidChangeActiveFullOutlineItem = new vscode.EventEmitter<void>();
  readonly onDidChangeActiveFullOutlineItem = this._onDidChangeActiveFullOutlineItem.event;
  get activeFullOutlineItem(): FullTreeItem | undefined {
    return this._activeItem;
  }

  private _versionedDocumentId: string | undefined = undefined;
  get versionedDocumentId(): string | undefined {
    return this._versionedDocumentId;
  }

  private debouncedRefreshFullOutline = debounce(
    this.refreshFullOutline.bind(this),
    REFRESH_FULL_OUTLINE_DEBOUNCE_DELAY_MS
  );

  private refreshActiveItemTimeout: NodeJS.Timeout | undefined;

  private constructor(
    private regionStore: RegionStore,
    private documentSymbolStore: DocumentSymbolStore,
    subscriptions: vscode.Disposable[]
  ) {
    this.registerListeners(subscriptions);
    this.debouncedRefreshFullOutline();
  }

  private registerListeners(subscriptions: vscode.Disposable[]): void {
    vscode.workspace.onDidChangeTextDocument(this.onDocumentChange.bind(this), this, subscriptions);
    this.regionStore.onDidChangeRegions(this.debouncedRefreshFullOutline, this, subscriptions);
    this.documentSymbolStore.onDidChangeDocumentSymbols(
      this.debouncedRefreshFullOutline,
      this,
      subscriptions
    );
    vscode.window.onDidChangeTextEditorSelection(
      this.onSelectionChange.bind(this),
      this,
      subscriptions
    );
  }

  private onDocumentChange(event: vscode.TextDocumentChangeEvent): void {
    // RegionStore and DocumentSymbolStore will soon refresh the region and symbol data, at which
    // point we'll refresh the active item with the up-to-date data.
    if (event.document === vscode.window.activeTextEditor?.document) {
      this.clearRefreshActiveItemTimeoutIfExists();
    }
  }

  private refreshFullOutline(): void {
    const regionStoreVersionedDocumentId = this.regionStore.versionedDocumentId;
    const documentSymbolStoreVersionedDocumentId = this.documentSymbolStore.versionedDocumentId;
    if (regionStoreVersionedDocumentId !== documentSymbolStoreVersionedDocumentId) {
      // Wait for both region and symbol data to be synced on the same document version
      return;
    }
    this._versionedDocumentId = regionStoreVersionedDocumentId;
    this.refreshTopLevelItems();
    this.refreshActiveItem();
  }

  private refreshTopLevelItems(): void {
    const { flattenedRegions } = this.regionStore;
    const flattenedRegionItems = flattenedRegions.map(getFlattenedRegionFullTreeItem);
    const { flattenedDocumentSymbols } = this.documentSymbolStore;
    const flattenedSymbolItems = flattenedDocumentSymbols.map(getFlattenedSymbolFullTreeItem);
    const topLevelItems = generateTopLevelFullTreeItems({
      flattenedRegionItems,
      flattenedSymbolItems,
    });
    this._topLevelItems = topLevelItems;
    this._onDidChangeFullOutlineItems.fire();
  }

  private onSelectionChange(event: vscode.TextEditorSelectionChangeEvent): void {
    if (event.textEditor === vscode.window.activeTextEditor) {
      this.debouncedRefreshActiveItem();
    }
  }

  private debouncedRefreshActiveItem(): void {
    this.clearRefreshActiveItemTimeoutIfExists();
    this.refreshActiveItemTimeout = setTimeout(
      this.refreshActiveItem.bind(this),
      REFRESH_ACTIVE_ITEM_DEBOUNCE_DELAY_MS
    );
  }

  private refreshActiveItem(): void {
    this.clearRefreshActiveItemTimeoutIfExists();
    const cursorPosition = vscode.window.activeTextEditor?.selection.active;
    if (!cursorPosition) {
      return;
    }
    const oldActiveItem = this._activeItem;
    this._activeItem = getActiveFullTreeItem(this._topLevelItems, cursorPosition);
    if (this._activeItem !== oldActiveItem) {
      this._onDidChangeActiveFullOutlineItem.fire();
    }
  }

  private clearRefreshActiveItemTimeoutIfExists(): void {
    if (this.refreshActiveItemTimeout) {
      clearTimeout(this.refreshActiveItemTimeout);
      this.refreshActiveItemTimeout = undefined;
    }
  }
}
