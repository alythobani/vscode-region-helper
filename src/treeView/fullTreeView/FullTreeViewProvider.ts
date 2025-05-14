import * as vscode from "vscode";
import { getGlobalFullOutlineViewConfigValue } from "../../config/fullOutlineViewConfig";
import { isCurrentActiveVersionedDocumentId } from "../../lib/getVersionedDocumentId";
import { type FullOutlineStore } from "../../state/FullOutlineStore";
import { debounce } from "../../utils/debounce";
import { type FullTreeItem } from "./FullTreeItem";

const REFRESH_TREE_DEBOUNCE_DELAY_MS = 100;
const AUTO_HIGHLIGHT_ACTIVE_ITEM_DEBOUNCE_DELAY_MS = 100;

export class FullTreeViewProvider implements vscode.TreeDataProvider<FullTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<FullTreeItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private treeView: vscode.TreeView<FullTreeItem> | undefined;

  private debouncedRefreshTree = debounce(
    this.refreshTree.bind(this),
    REFRESH_TREE_DEBOUNCE_DELAY_MS
  );

  private autoHighlightActiveItemTimeout: NodeJS.Timeout | undefined;

  constructor(private fullOutlineStore: FullOutlineStore, subscriptions: vscode.Disposable[]) {
    this.registerListeners(subscriptions);
    this.debouncedAutoHighlightActiveItem();
  }

  private registerListeners(subscriptions: vscode.Disposable[]): void {
    vscode.window.onDidChangeActiveTextEditor(
      this.clearAutoHighlightActiveItemTimeoutIfExists.bind(this),
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
      this.clearAutoHighlightActiveItemTimeoutIfExists();
    }
  }

  private refreshTree(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  // #region Highlighting active item
  private onActiveItemChange(): void {
    this.debouncedAutoHighlightActiveItem();
  }

  private debouncedAutoHighlightActiveItem(): void {
    this.clearAutoHighlightActiveItemTimeoutIfExists();
    this.autoHighlightActiveItemTimeout = setTimeout(
      this.autoHighlightActiveItem.bind(this),
      AUTO_HIGHLIGHT_ACTIVE_ITEM_DEBOUNCE_DELAY_MS
    );
  }

  private clearAutoHighlightActiveItemTimeoutIfExists(): void {
    if (this.autoHighlightActiveItemTimeout) {
      clearTimeout(this.autoHighlightActiveItemTimeout);
      this.autoHighlightActiveItemTimeout = undefined;
    }
  }

  private autoHighlightActiveItem(): void {
    this.clearAutoHighlightActiveItemTimeoutIfExists();
    const shouldAutoHighlightActiveItem = getGlobalFullOutlineViewConfigValue(
      "shouldAutoHighlightActiveItem"
    );
    if (!shouldAutoHighlightActiveItem) {
      return;
    }
    if (!isCurrentActiveVersionedDocumentId(this.fullOutlineStore.versionedDocumentId)) {
      // The active item is from an old document version. We'll highlight the active item once
      // FullOutlineStore fires events for the new document version.
      return;
    }
    this.highlightActiveItem();
  }

  private highlightActiveItem(): void {
    const { activeFullOutlineItem } = this.fullOutlineStore;
    if (!this.treeView || !activeFullOutlineItem) {
      return;
    }
    this.treeView.reveal(activeFullOutlineItem, { select: true, focus: false });
  }
  // #endregion

  // #region Required TreeDataProvider methods
  getTreeItem(element: FullTreeItem): vscode.TreeItem {
    return element;
  }

  getParent(element: FullTreeItem): FullTreeItem | undefined {
    return element.parent;
  }

  getChildren(element?: FullTreeItem): FullTreeItem[] {
    return element ? element.children : this.fullOutlineStore.topLevelFullOutlineItems;
  }
  // #endregion

  /**
   * Sets the tree view for this provider and registers event listeners for expand/collapse events.
   * To be called after the tree view is created (which requires the provider to be created first,
   * hence why this can't go in the constructor).
   */
  setTreeView(treeView: vscode.TreeView<FullTreeItem>): void {
    this.treeView = treeView;
    treeView.onDidCollapseElement((event) =>
      this.fullOutlineStore.onCollapseTreeItem(event.element)
    );
    treeView.onDidExpandElement((event) => this.fullOutlineStore.onExpandTreeItem(event.element));
  }

  expandAllTreeItems(): void {
    if (!this.treeView) {
      return;
    }
    for (const topLevelItem of this.fullOutlineStore.topLevelFullOutlineItems) {
      this.treeView.reveal(topLevelItem, {
        select: false,
        focus: false,
        expand: 3, // Max depth
      });
    }
    // Finish by highlighting the cursor's active item
    this.highlightActiveItem();
  }
}
