import * as vscode from "vscode";
import {
  getGlobalRegionsViewConfigValue,
  setGlobalRegionsViewConfigValue,
} from "../config/regionsViewConfig";
import { type Region } from "../models/Region";
import { type RegionStore } from "./RegionStore";

/**
 * Configuration key for persisting the user's preference for showing the regions view.
 * This is separate from the actual visibility state - it represents user *intent*.
 */
const USER_WANTS_REGIONS_VIEW_KEY = "regionHelper.userWantsRegionsView";

/**
 * Manages smart auto-hide behavior for the REGIONS tree view.
 *
 * This follows the "contextual visibility" UI pattern where:
 * - The view auto-collapses when switching to documents without regions
 * - The view auto-expands when switching to documents with regions (if user hasn't explicitly hidden it)
 * - User's explicit show/hide actions are remembered as their preference
 *
 * State machine:
 * - `userWantsRegionsView`: User's preference (true = wants to see it when relevant, false = explicitly hidden)
 * - Actual visibility is controlled via the `regionHelper.regionsView.isVisible` setting
 *
 * The feature can be disabled via `regionHelper.regionsView.shouldAutoHide` setting.
 */
export class RegionsViewAutoHideManager {
  private treeView: vscode.TreeView<Region> | undefined;
  private userWantsRegionsView: boolean;
  /**
   * Flag to track when we're programmatically changing visibility.
   * When true, visibility change events should NOT update userWantsRegionsView.
   * This prevents auto-hide/show operations from being misinterpreted as user intent.
   */
  private isProgrammaticVisibilityChange = false;

  constructor(
    private regionStore: RegionStore,
    private workspaceState: vscode.Memento,
    subscriptions: vscode.Disposable[]
  ) {
    // Initialize user preference from workspace state (default: true - show when relevant)
    this.userWantsRegionsView = this.workspaceState.get<boolean>(USER_WANTS_REGIONS_VIEW_KEY, true);

    this.registerListeners(subscriptions);
  }

  private isAutoHideEnabled(): boolean {
    return getGlobalRegionsViewConfigValue("shouldAutoHide");
  }

  private registerListeners(subscriptions: vscode.Disposable[]): void {
    // Listen for region changes to auto-show when regions appear
    this.regionStore.onDidChangeRegions(this.onRegionsChanged.bind(this), this, subscriptions);

    // Listen for active editor changes to auto-hide/show based on document content
    vscode.window.onDidChangeActiveTextEditor(
      this.onActiveEditorChanged.bind(this),
      this,
      subscriptions
    );
  }

  /**
   * Sets the tree view reference and registers visibility change listener.
   * Must be called after the tree view is created.
   */
  setTreeView(treeView: vscode.TreeView<Region>): void {
    this.treeView = treeView;
    treeView.onDidChangeVisibility(this.onTreeViewVisibilityChanged.bind(this));

    // Apply initial visibility state based on current document
    this.updateVisibilityForCurrentDocument();
  }

  /**
   * Called when the tree view's visibility changes (user manually expands/collapses).
   * Updates user preference based on their action.
   * 
   * IMPORTANT: Only updates preference when the change was NOT initiated by our code.
   * This prevents auto-hide/show operations from being misinterpreted as user intent.
   */
  private onTreeViewVisibilityChanged(event: vscode.TreeViewVisibilityChangeEvent): void {
    // If this visibility change was triggered by our own showRegionsView/hideRegionsView calls,
    // do NOT interpret it as user intent
    if (this.isProgrammaticVisibilityChange) {
      return;
    }

    const hasRegions = this.regionStore.topLevelRegions.length > 0;

    if (event.visible) {
      // User expanded the view - they want to see it
      this.setUserWantsRegionsView(true);
    } else if (hasRegions) {
      // User collapsed the view while it had regions - they explicitly don't want to see it
      this.setUserWantsRegionsView(false);
    }
    // If collapsed while empty, don't change preference (it was auto-hidden)
  }

  /**
   * Called when regions change in the current document.
   * Auto-shows the view if regions appear and user wants to see it.
   */
  private onRegionsChanged(): void {
    if (!this.isAutoHideEnabled()) {
      return;
    }

    const hasRegions = this.regionStore.topLevelRegions.length > 0;
    const isCurrentlyVisible = this.isRegionsViewVisible();

    if (hasRegions && !isCurrentlyVisible && this.userWantsRegionsView) {
      // Regions appeared and user wants to see the view - show it
      this.showRegionsView();
    } else if (!hasRegions && isCurrentlyVisible) {
      // No regions - hide the view (but don't change user preference)
      this.hideRegionsView();
    }
  }

  /**
   * Called when the active editor changes.
   * Updates view visibility based on whether the new document has regions.
   */
  private onActiveEditorChanged(): void {
    // Small delay to let RegionStore update first
    setTimeout(() => this.updateVisibilityForCurrentDocument(), 150);
  }

  /**
   * Updates the view visibility based on the current document's regions.
   */
  private updateVisibilityForCurrentDocument(): void {
    if (!this.isAutoHideEnabled()) {
      return;
    }

    const hasRegions = this.regionStore.topLevelRegions.length > 0;
    const isCurrentlyVisible = this.isRegionsViewVisible();

    if (hasRegions && this.userWantsRegionsView && !isCurrentlyVisible) {
      this.showRegionsView();
    } else if (!hasRegions && isCurrentlyVisible) {
      this.hideRegionsView();
    }
  }

  private setUserWantsRegionsView(value: boolean): void {
    if (this.userWantsRegionsView !== value) {
      this.userWantsRegionsView = value;
      this.workspaceState.update(USER_WANTS_REGIONS_VIEW_KEY, value);
    }
  }

  private isRegionsViewVisible(): boolean {
    return getGlobalRegionsViewConfigValue("isVisible");
  }

  private showRegionsView(): void {
    this.isProgrammaticVisibilityChange = true;
    Promise.resolve(setGlobalRegionsViewConfigValue("isVisible", true))
      .then(() => {
        // Reset flag after the config change has been applied
        // Use a small delay to ensure the visibility change event has fired
        setTimeout(() => {
          this.isProgrammaticVisibilityChange = false;
        }, 50);
      })
      .catch(() => {
        // Reset flag on error to avoid getting stuck
        this.isProgrammaticVisibilityChange = false;
      });
  }

  private hideRegionsView(): void {
    this.isProgrammaticVisibilityChange = true;
    Promise.resolve(setGlobalRegionsViewConfigValue("isVisible", false))
      .then(() => {
        // Reset flag after the config change has been applied
        // Use a small delay to ensure the visibility change event has fired
        setTimeout(() => {
          this.isProgrammaticVisibilityChange = false;
        }, 50);
      })
      .catch(() => {
        // Reset flag on error to avoid getting stuck
        this.isProgrammaticVisibilityChange = false;
      });
  }

  // #region Public API for testing

  /**
   * Gets whether the user wants the regions view to be shown (when relevant).
   * This is the user's preference, not the current visibility state.
   */
  getUserWantsRegionsView(): boolean {
    return this.userWantsRegionsView;
  }

  /**
   * Resets the user's preference to the default (wants to see the view).
   * This can be used to recover from a corrupted state or as a "reset" command.
   */
  resetUserPreference(): void {
    this.setUserWantsRegionsView(true);
  }

  /**
   * For testing: directly set user preference without triggering side effects.
   */
  _setUserWantsRegionsViewForTesting(value: boolean): void {
    this.userWantsRegionsView = value;
  }

  /**
   * For testing: check if a programmatic visibility change is in progress.
   */
  _isProgrammaticVisibilityChange(): boolean {
    return this.isProgrammaticVisibilityChange;
  }

  /**
   * For testing: simulate visibility change event.
   */
  _simulateVisibilityChange(visible: boolean): void {
    this.onTreeViewVisibilityChanged({ visible });
  }

  /**
   * For testing: trigger region change handler.
   */
  _triggerRegionsChanged(): void {
    this.onRegionsChanged();
  }

  /**
   * For testing: trigger editor change handler.
   */
  _triggerActiveEditorChanged(): void {
    this.onActiveEditorChanged();
  }

  // #endregion
}
