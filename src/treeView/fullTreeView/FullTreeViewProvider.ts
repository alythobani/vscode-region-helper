import * as vscode from "vscode";
import { getGlobalFullOutlineViewConfigValue } from "../../config/fullOutlineViewConfig";
import { isCurrentActiveVersionedDocumentId } from "../../lib/getVersionedDocumentId";
import { type CollapsibleStateManager } from "../../state/CollapsibleStateManager";
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
  private isTreeViewVisible = false;

  constructor(
    private fullOutlineStore: FullOutlineStore,
    private collapsibleStateManager: CollapsibleStateManager,
    subscriptions: vscode.Disposable[]
  ) {
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

  /**
   * Auto-highlights (using `treeView.reveal`) the active item in the tree view if:
   * 1. The tree view is visible
   * 2. The `shouldAutoHighlightActiveItem` setting is enabled
   * 3. The active item is from the active editor's current document version
   */
  private autoHighlightActiveItem(): void {
    this.clearAutoHighlightActiveItemTimeoutIfExists();
    if (!this.isTreeViewVisible) {
      // Revealing the active item when the view isn't already visible would expand it if collapsed
      // and/or change panel if not already open (e.g. if in Search view), which would be annoying
      return;
    }
    const shouldAutoHighlightActiveItem = getGlobalFullOutlineViewConfigValue(
      "shouldAutoHighlightActiveItem"
    );
    if (!shouldAutoHighlightActiveItem) {
      return;
    }
    if (!isCurrentActiveVersionedDocumentId(this.fullOutlineStore.versionedDocumentId)) {
      // The active item is from an old document version. We'll auto-highlight the active item once
      // FullOutlineStore fires events for the new document version.
      return;
    }
    this.highlightActiveItem();
  }

  private highlightActiveItem({ expand = false }: { expand?: boolean | number } = {}): void {
    this.clearAutoHighlightActiveItemTimeoutIfExists();
    const { activeFullOutlineItem } = this.fullOutlineStore;
    if (!this.treeView || !activeFullOutlineItem) {
      return;
    }
    this.treeView.reveal(activeFullOutlineItem, { select: true, focus: false, expand });
  }
  // #endregion

  // #region Required TreeDataProvider methods
  getTreeItem(element: FullTreeItem): vscode.TreeItem {
    // Update collapsible state from saved state or default based on children
    element.collapsibleState = this.getCollapsibleState(element);
    return element;
  }

  private getCollapsibleState(element: FullTreeItem): vscode.TreeItemCollapsibleState {
    if (element.children.length === 0) {
      return vscode.TreeItemCollapsibleState.None;
    }
    const savedCollapsibleState = this.collapsibleStateManager.getSavedCollapsibleState({
      documentId: this.fullOutlineStore.documentId,
      itemId: element.id,
    });
    return savedCollapsibleState ?? vscode.TreeItemCollapsibleState.Expanded;
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
    treeView.onDidCollapseElement(this.onDidCollapseElement.bind(this));
    treeView.onDidExpandElement(this.onDidExpandElement.bind(this));
    treeView.onDidChangeVisibility(this.onTreeViewVisibilityChanged.bind(this));
  }

  // #region Tree view events

  // #region On item collapse/expand

  onDidCollapseElement(event: vscode.TreeViewExpansionEvent<FullTreeItem>): void {
    const { id: itemId } = event.element;
    const { documentId, allParentIds } = this.fullOutlineStore;
    this.collapsibleStateManager.onCollapseTreeItem({ itemId, documentId, allParentIds });
  }

  onDidExpandElement(event: vscode.TreeViewExpansionEvent<FullTreeItem>): void {
    const { id: itemId } = event.element;
    const { documentId, allParentIds } = this.fullOutlineStore;
    this.collapsibleStateManager.onExpandTreeItem({ itemId, documentId, allParentIds });
  }

  expandAllTreeItems(): void {
    if (!this.treeView) {
      return;
    }
    const { documentId, topLevelFullOutlineItems } = this.fullOutlineStore;
    this.collapsibleStateManager.onExpandAllTreeItems({ documentId });
    for (const topLevelItem of topLevelFullOutlineItems) {
      this.treeView.reveal(topLevelItem, {
        select: false,
        focus: false,
        expand: 3, // Max depth
      });
    }
    // Finish by highlighting the cursor's active item. We do this regardless of the
    // `shouldAutoHighlightActiveItem` setting, since the view is open anyway when/after calling
    // Expand All, so there's no harm in revealing. This helps re-orient instead of scroll position
    // being reset to the top of the tree view.
    this.highlightActiveItem({ expand: 3 });
  }

  // #endregion

  // #region On tree view visibility change

  onTreeViewVisibilityChanged(event: vscode.TreeViewVisibilityChangeEvent): void {
    if (event.visible) {
      this.isTreeViewVisible = true;
      this.debouncedAutoHighlightActiveItem();
    } else {
      this.isTreeViewVisible = false;
      this.clearAutoHighlightActiveItemTimeoutIfExists();
    }
  }

  // #endregion

  // #endregion
}
