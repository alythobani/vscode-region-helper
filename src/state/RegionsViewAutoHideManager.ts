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
 * Fallback timeout for clearing the pending programmatic change flag.
 * This is a safety net in case the visibility change event never fires.
 * Should be long enough to cover VS Code's processing time but short enough
 * to not cause issues if the event is genuinely missed.
 */
const PROGRAMMATIC_CHANGE_FALLBACK_TIMEOUT_MS = 500;

/**
 * Manages smart auto-hide behavior for the REGIONS tree view.
 *
 * This follows the "contextual visibility" UI pattern where:
 * - The view auto-collapses when switching to documents without regions
 * - The view auto-expands when switching to documents with regions (if user hasn't explicitly hidden it)
 * - User's explicit show/hide actions are remembered as their preference
 *
 * Race condition handling (Visibility Diff pattern):
 * - Tracks `expectedVisibility` before making programmatic changes
 * - Uses `pendingProgrammaticChange` flag to mark when we're in the middle of a change
 * - In `onTreeViewVisibilityChanged`, compares actual vs expected visibility
 * - If visibility matches expected, it was our programmatic change
 * - If visibility differs from expected, it was a user override
 * - Fallback timeout ensures flag is cleared if callback never fires
 *
 * State machine:
 * - `userWantsRegionsView`: User's preference (true = wants to see it when relevant, false = explicitly hidden)
 * - Actual visibility is controlled via the `regionHelper.regionsView.isVisible` setting
 *
 * The feature can be disabled via `regionHelper.regionsView.shouldAutoHide` setting.
 */
export class RegionsViewAutoHideManager implements vscode.Disposable {
  private userWantsRegionsView: boolean;

  /**
   * Flag indicating we have initiated a programmatic visibility change
   * and are waiting for the visibility changed event to fire.
   */
  private pendingProgrammaticChange = false;

  /**
   * The visibility state we expect to see after the pending programmatic change.
   * Used to distinguish our changes from concurrent user changes.
   */
  private expectedVisibility: boolean | undefined;

  /**
   * Fallback timeout handle for clearing pendingProgrammaticChange.
   * Ensures we don't get stuck if the visibility event never fires.
   */
  private programmaticChangeFallbackTimeout: NodeJS.Timeout | undefined;

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

  /**
   * Timeout handle for delayed initialization after setTreeView is called.
   */
  private initializationTimeout: NodeJS.Timeout | undefined;

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
    this.subscriptions.push(
      treeView.onDidChangeVisibility(this.onTreeViewVisibilityChanged.bind(this))
    );

    // Wait for RegionStore to finish its initial parse before applying visibility.
    // RegionStore's debounce is 100ms, so we wait a bit longer to be safe.
    this.initializationTimeout = setTimeout(() => {
      this.initializationTimeout = undefined;
      this.isInitialized = true;
      this.updateVisibilityForCurrentDocument();
    }, EDITOR_CHANGE_VISIBILITY_DELAY_MS);
  }

  dispose(): void {
    this.clearPendingProgrammaticChange();
    if (this.pendingEditorChangeTimeout) {
      clearTimeout(this.pendingEditorChangeTimeout);
      this.pendingEditorChangeTimeout = undefined;
    }
    if (this.initializationTimeout) {
      clearTimeout(this.initializationTimeout);
      this.initializationTimeout = undefined;
    }
  }

  /**
   * Called when the tree view's visibility changes (user manually expands/collapses).
   * Updates user preference based on their action.
   *
   * Uses the Visibility Diff pattern to distinguish programmatic changes from user intent:
   * - If we have a pending programmatic change AND the new visibility matches what we expected,
   *   this is our change and we should NOT update user preference.
   * - If visibility differs from expected, the user overrode our change concurrently.
   * - If no pending change, this is definitely user intent.
   */
  private onTreeViewVisibilityChanged(event: vscode.TreeViewVisibilityChangeEvent): void {
    // Check if this matches our pending programmatic change
    if (this.pendingProgrammaticChange) {
      if (event.visible === this.expectedVisibility) {
        // This is our programmatic change completing - clear the flag and return
        this.clearPendingProgrammaticChange();
        return;
      } else {
        // User changed visibility concurrently (overriding our change)
        // Clear our pending state but continue to process as user intent
        this.clearPendingProgrammaticChange();
      }
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
   * Clears the pending programmatic change state and its fallback timeout.
   */
  private clearPendingProgrammaticChange(): void {
    this.pendingProgrammaticChange = false;
    this.expectedVisibility = undefined;
    if (this.programmaticChangeFallbackTimeout) {
      clearTimeout(this.programmaticChangeFallbackTimeout);
      this.programmaticChangeFallbackTimeout = undefined;
    }
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
    // Clear any existing pending state before starting new change
    this.clearPendingProgrammaticChange();

    // Mark that we're initiating a programmatic change and what we expect
    this.pendingProgrammaticChange = true;
    this.expectedVisibility = true;

    // Set up fallback timeout to clear state if visibility event never fires
    this.programmaticChangeFallbackTimeout = setTimeout(() => {
      this.pendingProgrammaticChange = false;
      this.expectedVisibility = undefined;
      this.programmaticChangeFallbackTimeout = undefined;
    }, PROGRAMMATIC_CHANGE_FALLBACK_TIMEOUT_MS);

    Promise.resolve(setGlobalRegionsViewConfigValue("isVisible", true)).catch(() => {
      // On error, clear the pending state
      this.clearPendingProgrammaticChange();
    });
  }

  private hideRegionsView(): void {
    // Clear any existing pending state before starting new change
    this.clearPendingProgrammaticChange();

    // Mark that we're initiating a programmatic change and what we expect
    this.pendingProgrammaticChange = true;
    this.expectedVisibility = false;

    // Set up fallback timeout to clear state if visibility event never fires
    this.programmaticChangeFallbackTimeout = setTimeout(() => {
      this.pendingProgrammaticChange = false;
      this.expectedVisibility = undefined;
      this.programmaticChangeFallbackTimeout = undefined;
    }, PROGRAMMATIC_CHANGE_FALLBACK_TIMEOUT_MS);

    Promise.resolve(setGlobalRegionsViewConfigValue("isVisible", false)).catch(() => {
      // On error, clear the pending state
      this.clearPendingProgrammaticChange();
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
    return this.pendingProgrammaticChange;
  }

  /**
   * For testing: get the expected visibility for pending programmatic change.
   */
  _getExpectedVisibility(): boolean | undefined {
    return this.expectedVisibility;
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
