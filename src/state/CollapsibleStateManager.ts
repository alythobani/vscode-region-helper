import * as vscode from "vscode";
import { getDocumentIdFromUri } from "../lib/getVersionedDocumentId";
import { debounce } from "../utils/debounce";
import { throwNever } from "../utils/errorUtils";
import { isEmptyObject } from "../utils/objectUtils";

const CLEAN_IDS_AND_MAYBE_SWITCH_MODE_DEBOUNCE_DELAY_MS = 2000;
const SAVE_TO_WORKSPACE_STATE_DEBOUNCE_DELAY_MS = 15000;

/** Whether we should store a set of IDs for collapsed or expanded items; we can switch modes to
 * reduce how much data we need to store. E.g. after calling "Expand All" we should switch to
 * `collapsedItemIds` mode; after collapsing all items we should switch to `expandedItemIds`. */
type StorageMode = "collapsedItemIds" | "expandedItemIds";

/**
 * Items are expanded by default, so the default storage mode is `collapsedItemIds` to reduce the
 * number of IDs we need to store.
 */
const DEFAULT_STORAGE_MODE: StorageMode = "collapsedItemIds";

type CollapsibleStateStore = {
  /** Whether we should store collapsed or expanded item IDs */
  storageMode: StorageMode;
  /** A set of either collapsed or expanded item IDs, depending on `storageMode` */
  itemIds: Set<string>;
};
type CollapsibleStateStoreByDocumentId = Record<string, CollapsibleStateStore>;

type SerializedCollapsibleStateStore = {
  storageMode: StorageMode;
  itemIds: string[];
};
type SerializedCollapsibleStateStoreByDocumentId = Record<string, SerializedCollapsibleStateStore>;

/**
 * Manages the collapsible state (Expanded/Collapsed) of tree items across files, so that
 * collapsible state persists across sessions and file switches.
 */
export class CollapsibleStateManager {
  private collapsibleStateStoreByDocumentId: CollapsibleStateStoreByDocumentId = {};

  private debouncedCleanIdsAndMaybeSwitchMode = debounce(
    this.cleanIdsAndMaybeSwitchMode.bind(this),
    CLEAN_IDS_AND_MAYBE_SWITCH_MODE_DEBOUNCE_DELAY_MS
  );

  private debouncedSaveToWorkspaceState = debounce(async () => {
    await this.saveToWorkspaceState();
  }, SAVE_TO_WORKSPACE_STATE_DEBOUNCE_DELAY_MS);

  constructor(private workspaceState: vscode.Memento, private storageKey: string) {
    this.loadFromWorkspaceState();
    vscode.workspace.onDidRenameFiles((event) => {
      const { files } = event;
      for (const fileRenaming of files) this.onFileRename(fileRenaming);
    });
    vscode.workspace.onDidDeleteFiles((event) => {
      const { files } = event;
      for (const deletedUri of files) this.onFileDelete(deletedUri);
    });
  }

  private onFileRename({ oldUri, newUri }: { oldUri: vscode.Uri; newUri: vscode.Uri }): void {
    const oldDocId = getDocumentIdFromUri(oldUri);
    const newDocId = getDocumentIdFromUri(newUri);
    const store = this.collapsibleStateStoreByDocumentId[oldDocId];
    if (!store) return;
    this.collapsibleStateStoreByDocumentId[newDocId] = store;
    this.deleteDocumentStore(oldDocId);
    this.debouncedSaveToWorkspaceState();
  }

  private onFileDelete(deletedUri: vscode.Uri): void {
    const deletedDocId = getDocumentIdFromUri(deletedUri);
    this.deleteDocumentStore(deletedDocId);
    this.debouncedSaveToWorkspaceState();
  }

  /** Gets the saved collapsible state of the given item ID in the given document, if available.
   * Assumes the item has children and thus is collapsible or expandable; if it's not, then
   * {@link vscode.TreeItemCollapsibleState.None TreeItemCollapsibleState.None} should be used
   * either way.
   */
  getSavedCollapsibleState({
    documentId,
    itemId,
  }: {
    documentId: string | undefined;
    itemId: string;
  }): vscode.TreeItemCollapsibleState | undefined {
    if (documentId === undefined) {
      console.warn("No document ID provided for collapsible state lookup");
      return undefined;
    }
    const collapsibleStateStore = this.collapsibleStateStoreByDocumentId[documentId];
    if (!collapsibleStateStore) return undefined;
    const { storageMode, itemIds } = collapsibleStateStore;
    switch (storageMode) {
      case "collapsedItemIds":
        return itemIds.has(itemId)
          ? vscode.TreeItemCollapsibleState.Collapsed
          : vscode.TreeItemCollapsibleState.Expanded; // defaults to Expanded, but a childless item should be None
      case "expandedItemIds":
        return itemIds.has(itemId)
          ? vscode.TreeItemCollapsibleState.Expanded
          : vscode.TreeItemCollapsibleState.Collapsed; // defaults to Collapsed, but a childless item should be None
      default:
        throwNever(storageMode);
    }
  }

  // #region On collapse/expand

  onCollapseTreeItem({
    itemId,
    documentId,
    allParentIds,
  }: {
    itemId: string;
    documentId: string | undefined;
    allParentIds: Set<string>;
  }): void {
    if (documentId === undefined) {
      console.warn("No document ID provided for collapse event");
      return;
    }
    const store = this.getOrCreateStoreForDocument(documentId);
    switch (store.storageMode) {
      case "collapsedItemIds":
        store.itemIds.add(itemId);
        this.debouncedCleanIdsAndMaybeSwitchMode(store, allParentIds);
        break;
      case "expandedItemIds":
        store.itemIds.delete(itemId);
        break;
      default:
        throwNever(store.storageMode);
    }
    this.debouncedSaveToWorkspaceState();
  }

  onExpandTreeItem({
    itemId,
    documentId,
    allParentIds,
  }: {
    itemId: string;
    documentId: string | undefined;
    allParentIds: Set<string>;
  }): void {
    if (documentId === undefined) {
      console.warn("No document ID provided for expand event");
      return;
    }
    const store = this.getOrCreateStoreForDocument(documentId);
    switch (store.storageMode) {
      case "collapsedItemIds":
        store.itemIds.delete(itemId);
        break;
      case "expandedItemIds":
        store.itemIds.add(itemId);
        this.debouncedCleanIdsAndMaybeSwitchMode(store, allParentIds);
        break;
      default:
        throwNever(store.storageMode);
    }
    this.debouncedSaveToWorkspaceState();
  }

  onExpandAllTreeItems({ documentId }: { documentId: string | undefined }): void {
    if (documentId === undefined) {
      return;
    }
    const store = this.getOrCreateStoreForDocument(documentId);
    // Regardless of the current storage mode, now that all items are going to be expanded (i.e.
    // none collapsed), we should switch to collapsedItemIds mode and clear the item IDs set
    store.storageMode = "collapsedItemIds";
    store.itemIds.clear();
    this.debouncedSaveToWorkspaceState();
  }

  // #endregion

  // #region Document store management

  private getOrCreateStoreForDocument(documentId: string): CollapsibleStateStore {
    const store = this.collapsibleStateStoreByDocumentId[documentId];
    if (store) return store;
    const newStore: CollapsibleStateStore = {
      storageMode: DEFAULT_STORAGE_MODE,
      itemIds: new Set(),
    };
    this.collapsibleStateStoreByDocumentId[documentId] = newStore;
    return newStore;
  }

  /** Cleans up the IDs in the store, removing any that are no longer valid (e.g. they may have been
   * added earlier but since renamed and no longer valid in the document). Switches storage mode if
   * the store is full after cleaning (i.e. all parent items are stored in itemIds).
   */
  private cleanIdsAndMaybeSwitchMode(
    store: CollapsibleStateStore,
    allParentIds: Set<string>
  ): void {
    this.removeInvalidItemIds(store, allParentIds);
    this.maybeSwitchStorageMode(store, allParentIds);
  }

  /** Removes item IDs from the store that are not in the set of all parent IDs. This is particularly
   * important before potentially switching storage modes depending on if all parent IDs are stored
   * in item IDs (representing all collapsible items being expanded/collapsed), since outdated IDs
   * would lead that check to be incorrect.
   */
  private removeInvalidItemIds(store: CollapsibleStateStore, allParentIds: Set<string>): void {
    for (const itemId of store.itemIds) {
      if (!allParentIds.has(itemId)) {
        store.itemIds.delete(itemId);
      }
    }
  }

  /** Switches the storage mode if all parent IDs are stored in item IDs. */
  private maybeSwitchStorageMode(store: CollapsibleStateStore, allParentIds: Set<string>): void {
    const { itemIds, storageMode } = store;
    if (itemIds.size >= allParentIds.size) {
      itemIds.clear();
      store.storageMode = this.getOppositeStorageMode(storageMode);
    }
  }

  /** Returns the opposite storage mode of the given storage mode. */
  private getOppositeStorageMode(storageMode: StorageMode): StorageMode {
    switch (storageMode) {
      case "collapsedItemIds":
        return "expandedItemIds";
      case "expandedItemIds":
        return "collapsedItemIds";
      default:
        throwNever(storageMode);
    }
  }

  private deleteDocumentStore(documentId: string): void {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete this.collapsibleStateStoreByDocumentId[documentId];
  }

  // #endregion

  // #region Workspace storage

  /** Loads persisted collapse state from storage into memory */
  private loadFromWorkspaceState(): void {
    const serializedStoreByDocId =
      this.workspaceState.get<SerializedCollapsibleStateStoreByDocumentId>(this.storageKey);
    if (!serializedStoreByDocId) {
      return;
    }

    for (const [docId, serializedStore] of Object.entries(serializedStoreByDocId)) {
      this.collapsibleStateStoreByDocumentId[docId] = {
        storageMode: serializedStore.storageMode,
        itemIds: new Set(serializedStore.itemIds),
      };
    }
  }

  /** Saves the current state to VS Code's workspace storage (if storage is provided) */
  async saveToWorkspaceState(): Promise<void> {
    const serializedStoreByDocId: SerializedCollapsibleStateStoreByDocumentId = {};
    for (const [docId, store] of Object.entries(this.collapsibleStateStoreByDocumentId)) {
      const { storageMode, itemIds } = store;
      if (this.isDefaultStore(store)) {
        // No need to save a default store
        continue;
      }
      serializedStoreByDocId[docId] = { storageMode, itemIds: Array.from(itemIds) };
    }
    if (isEmptyObject(serializedStoreByDocId)) {
      await this.workspaceState.update(this.storageKey, undefined);
      return;
    }
    await this.workspaceState.update(this.storageKey, serializedStoreByDocId);
  }

  // #endregion

  private isDefaultStore(store: CollapsibleStateStore): boolean {
    const { storageMode, itemIds } = store;
    return storageMode === DEFAULT_STORAGE_MODE && itemIds.size === 0;
  }
}
