import * as vscode from "vscode";
import { getGlobalFullOutlineViewConfigValue } from "../../config/fullOutlineViewConfig";
import { isCurrentActiveVersionedDocumentId } from "../../lib/getVersionedDocumentId";
import { type FullOutlineStore } from "../../state/FullOutlineStore";
import { debounce } from "../../utils/debounce";
import { type FullTreeItem } from "./FullTreeItem";

const REFRESH_TREE_DEBOUNCE_DELAY_MS = 100;
const HIGHLIGHT_ACTIVE_ITEM_DEBOUNCE_DELAY_MS = 100;

export class FullTreeViewProvider implements vscode.TreeDataProvider<FullTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<FullTreeItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private treeView: vscode.TreeView<FullTreeItem> | undefined;

  private debouncedRefreshTree = debounce(
    this.refreshTree.bind(this),
    REFRESH_TREE_DEBOUNCE_DELAY_MS
  );

  private highlightActiveItemTimeout: NodeJS.Timeout | undefined;

  constructor(private fullOutlineStore: FullOutlineStore, subscriptions: vscode.Disposable[]) {
    this.registerListeners(subscriptions);
    this.debouncedHighlightActiveItem();
  }

  private registerListeners(subscriptions: vscode.Disposable[]): void {
    vscode.window.onDidChangeActiveTextEditor(
      this.clearHighlightActiveItemTimeoutIfExists.bind(this),
      this,
      subscriptions
    );
    vscode.workspace.onDidChangeTextDocument(this.onDocumentChange.bind(this), this, subscriptions);
    this.fullOutlineStore.onDidChangeFullOutlineItems(
      this.debouncedRefreshTree,
      this,
      subscriptions
    );
    this.fullOutlineStore.onDidChangeActiveFullOutlineItem(
      this.onActiveItemChange.bind(this),
      this,
      subscriptions
    );
  }

  private onDocumentChange(event: vscode.TextDocumentChangeEvent): void {
    if (event.document === vscode.window.activeTextEditor?.document) {
      // Cancel any existing timeout to highlight the active item; we can wait for the upcoming
      // update from FullOutlineStore to refresh the up-to-date active item.
      this.clearHighlightActiveItemTimeoutIfExists();
    }
  }

  private refreshTree(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  private onActiveItemChange(): void {
    this.debouncedHighlightActiveItem();
  }

  private debouncedHighlightActiveItem(): void {
    this.clearHighlightActiveItemTimeoutIfExists();
    this.highlightActiveItemTimeout = setTimeout(
      this.highlightActiveItem.bind(this),
      HIGHLIGHT_ACTIVE_ITEM_DEBOUNCE_DELAY_MS
    );
  }

  private clearHighlightActiveItemTimeoutIfExists(): void {
    if (this.highlightActiveItemTimeout) {
      clearTimeout(this.highlightActiveItemTimeout);
      this.highlightActiveItemTimeout = undefined;
    }
  }

  private highlightActiveItem(): void {
    this.clearHighlightActiveItemTimeoutIfExists();
    const shouldHighlightActiveItem = getGlobalFullOutlineViewConfigValue(
      "shouldAutoHighlightActiveItem"
    );
    if (!shouldHighlightActiveItem) {
      return;
    }
    const { activeFullOutlineItem, versionedDocumentId } = this.fullOutlineStore;
    if (!this.treeView || !activeFullOutlineItem) {
      return;
    }
    if (!isCurrentActiveVersionedDocumentId(versionedDocumentId)) {
      // The active item is from an old document version. We'll highlight the active item once
      // FullOutlineStore fires events for the new document version.
      return;
    }
    this.treeView.reveal(activeFullOutlineItem, { select: true, focus: false });
  }

  getTreeItem(element: FullTreeItem): vscode.TreeItem {
    return element;
  }

  getParent(element: FullTreeItem): FullTreeItem | undefined {
    return element.parent;
  }

  getChildren(element?: FullTreeItem): FullTreeItem[] {
    return element ? element.children : this.fullOutlineStore.topLevelFullOutlineItems;
  }

  setTreeView(treeView: vscode.TreeView<FullTreeItem>): void {
    this.treeView = treeView;
  }
}
