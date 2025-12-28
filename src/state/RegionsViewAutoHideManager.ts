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
 * Delay before checking visibility after editor change.
 * Must be longer than RegionStore's debounce (100ms) + some buffer for parsing.
 */
const EDITOR_CHANGE_VISIBILITY_DELAY_MS = 250;

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
   * Counter to track ongoing programmatic visibility changes.
   * Incremented when starting a change, decremented when complete.
   * When > 0, visibility change events should NOT update userWantsRegionsView.
   * Using a counter (vs. boolean) handles rapid consecutive calls correctly.
   */
  private programmaticVisibilityChangeCount = 0;

  /**
   * Whether the tree view has been set and initial visibility has been applied.
   * Before this is true, we should not respond to region change events.
   */
  private isInitialized = false;

  /**
   * Timeout handle for pending visibility updates on editor change.
   * Used to cancel previous pending updates when editor changes rapidly.
   */
  private pendingEditorChangeTimeout: NodeJS.Timeout | undefined;

  constructor(
    private regionStore: RegionStore,
    private workspaceState: vscode.Memento,
    private subscriptions: vscode.Disposable[]
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
    subscriptions.push(
      this.regionStore.onDidChangeRegions(this.onRegionsChanged.bind(this), this)
    );

    // Listen for active editor changes to auto-hide/show based on document content
    subscriptions.push(
      vscode.window.onDidChangeActiveTextEditor(this.onActiveEditorChanged.bind(this), this)
    );
  }

  /**
   * Sets the tree view reference and registers visibility change listener.
   * Must be called after the tree view is created.
   */
  setTreeView(treeView: vscode.TreeView<Region>): void {
    this.treeView = treeView;
    this.subscriptions.push(
      treeView.onDidChangeVisibility(this.onTreeViewVisibilityChanged.bind(this))
    );

    // Wait for RegionStore to finish its initial parse before applying visibility.
    // RegionStore's debounce is 100ms, so we wait a bit longer to be safe.
    setTimeout(() => {
      this.isInitialized = true;
      this.updateVisibilityForCurrentDocument();
    }, EDITOR_CHANGE_VISIBILITY_DELAY_MS);
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
    if (this.programmaticVisibilityChangeCount > 0) {
      return;
    }

    // If not yet initialized, don't interpret visibility changes as user intent
    if (!this.isInitialized) {
      return;
    }

    // Re-read from workspace state in case it was changed externally (e.g., by reset command)
    this.syncUserPreferenceFromWorkspaceState();

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
   * Sync in-memory preference with workspace state.
   * This is needed because external commands can update the workspace state.
   */
  private syncUserPreferenceFromWorkspaceState(): void {
    this.userWantsRegionsView = this.workspaceState.get<boolean>(USER_WANTS_REGIONS_VIEW_KEY, true);
  }

  /**
   * Called when regions change in the current document.
   * Auto-shows the view if regions appear and user wants to see it.
   */
  private onRegionsChanged(): void {
    // Don't process region changes until we're fully initialized
    if (!this.isInitialized) {
      return;
    }

    if (!this.isAutoHideEnabled()) {
      return;
    }

    // Re-read from workspace state in case it was changed externally
    this.syncUserPreferenceFromWorkspaceState();

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
    // Don't process editor changes until we're fully initialized
    if (!this.isInitialized) {
      return;
    }

    // Cancel any pending update from a previous editor change
    if (this.pendingEditorChangeTimeout) {
      clearTimeout(this.pendingEditorChangeTimeout);
      this.pendingEditorChangeTimeout = undefined;
    }

    // Wait for RegionStore to update (debounce 100ms + parsing time)
    this.pendingEditorChangeTimeout = setTimeout(() => {
      this.pendingEditorChangeTimeout = undefined;
      this.updateVisibilityForCurrentDocument();
    }, EDITOR_CHANGE_VISIBILITY_DELAY_MS);
  }

  /**
   * Updates the view visibility based on the current document's regions.
   */
  private updateVisibilityForCurrentDocument(): void {
    if (!this.isAutoHideEnabled()) {
      return;
    }

    // Re-read from workspace state in case it was changed externally
    this.syncUserPreferenceFromWorkspaceState();

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
    this.programmaticVisibilityChangeCount++;
    Promise.resolve(setGlobalRegionsViewConfigValue("isVisible", true))
      .then(() => {
        // Reset counter after the config change has been applied
        // Use a small delay to ensure the visibility change event has fired
        setTimeout(() => {
          this.programmaticVisibilityChangeCount = Math.max(
            0,
            this.programmaticVisibilityChangeCount - 1
          );
        }, 50);
      })
      .catch(() => {
        // Decrement counter on error to avoid getting stuck
        this.programmaticVisibilityChangeCount = Math.max(
          0,
          this.programmaticVisibilityChangeCount - 1
        );
      });
  }

  private hideRegionsView(): void {
    this.programmaticVisibilityChangeCount++;
    Promise.resolve(setGlobalRegionsViewConfigValue("isVisible", false))
      .then(() => {
        // Reset counter after the config change has been applied
        // Use a small delay to ensure the visibility change event has fired
        setTimeout(() => {
          this.programmaticVisibilityChangeCount = Math.max(
            0,
            this.programmaticVisibilityChangeCount - 1
          );
        }, 50);
      })
      .catch(() => {
        // Decrement counter on error to avoid getting stuck
        this.programmaticVisibilityChangeCount = Math.max(
          0,
          this.programmaticVisibilityChangeCount - 1
        );
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
    return this.programmaticVisibilityChangeCount > 0;
  }

  /**
   * For testing: check if the manager is initialized.
   */
  _isInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * For testing: force immediate initialization.
   */
  _forceInitialize(): void {
    this.isInitialized = true;
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

  /**
   * For testing: trigger immediate visibility update for current document.
   */
  _updateVisibilityNow(): void {
    this.updateVisibilityForCurrentDocument();
  }

  // #endregion
}
