import type * as vscode from "vscode";

import { type FlattenedRegion } from "../lib/flattenRegions";
import { type InvalidMarker } from "../lib/parseAllRegions";
import { type Region } from "../models/Region";
import { type FullTreeItem } from "../treeView/fullTreeView/FullTreeItem";

export type RegionHelperAPI = {
  // #region Regions API
  // #region Getters
  /** Returns an up-to-date list of top-level regions in the current active editor. This is used to
   * render the tree view, for example. The list will be empty if no editor is active. */
  getTopLevelRegions(): Region[];
  /** Returns an up-to-date flat list of all regions in the current active editor, each of which has
   * an extra `flatRegionIdx` field on it. This is used when navigating to previous/next regions,
   * for example.  The list will be empty if no editor is active. */
  getFlattenedRegions(): FlattenedRegion[];
  /** Returns the currently active region in the current active editor, if any. */
  getActiveRegion(): Region | undefined;
  /** Returns an up-to-date list of invalid markers (unmatched boundaries) in the current active
   * editor. The list will be empty if no editor is active. */
  getInvalidMarkers(): InvalidMarker[];
  // #endregion
  // #region Events
  /** An event that fires when the list of regions in the current active editor changes. */
  onDidChangeRegions: vscode.Event<void>;
  /** An event that fires when the active region in the current active editor changes. */
  onDidChangeActiveRegion: vscode.Event<void>;
  /** An event that fires when the list of invalid markers in the current active editor changes. */
  onDidChangeInvalidMarkers: vscode.Event<void>;
  // #endregion
  // #endregion
  // #region Full Outline API
  // #region Getters
  getTopLevelFullOutlineItems(): FullTreeItem[];
  getActiveFullOutlineItem(): FullTreeItem | undefined;
  // #endregion
  // #region Events
  onDidChangeFullOutlineItems: vscode.Event<void>;
  onDidChangeActiveFullOutlineItem: vscode.Event<void>;
  // #endregion
  // #endregion
};
