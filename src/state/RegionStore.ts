import * as vscode from "vscode";
import { type FlattenedRegion, flattenRegionsAndCountParents } from "../lib/flattenRegions";
import { getDocumentId, getVersionedDocumentId } from "../lib/getVersionedDocumentId";
import { type InvalidMarker, parseAllRegions } from "../lib/parseAllRegions";
import { type Region } from "../models/Region";
import { debounce } from "../utils/debounce";
import { getActiveRegion } from "../utils/getActiveRegion";

const REFRESH_REGIONS_DEBOUNCE_DELAY_MS = 100;
const REFRESH_ACTIVE_REGION_DEBOUNCE_DELAY_MS = 100;

export class RegionStore {
  // #region Singleton initialization
  private static _instance: RegionStore | undefined = undefined;

  static initialize(subscriptions: vscode.Disposable[]): RegionStore {
    if (this._instance) {
      throw new Error("RegionStore is already initialized! Only one instance is allowed.");
    }
    this._instance = new RegionStore(subscriptions);
    return this._instance;
  }

  static getInstance(): RegionStore {
    if (!this._instance) {
      throw new Error("RegionStore is not initialized! Call `initialize()` first.");
    }
    return this._instance;
  }
  // #endregion

  // #region Public properties
  private _topLevelRegions: Region[] = [];
  private _flattenedRegions: FlattenedRegion[] = [];
  private _onDidChangeRegions = new vscode.EventEmitter<void>();
  readonly onDidChangeRegions = this._onDidChangeRegions.event;
  get topLevelRegions(): Region[] {
    return this._topLevelRegions;
  }
  get flattenedRegions(): FlattenedRegion[] {
    return this._flattenedRegions;
  }

  private _allParentIds: Set<string> = new Set<string>();
  get allParentIds(): Set<string> {
    return this._allParentIds;
  }

  private _activeRegion: Region | undefined = undefined;
  private _onDidChangeActiveRegion = new vscode.EventEmitter<void>();
  readonly onDidChangeActiveRegion = this._onDidChangeActiveRegion.event;
  get activeRegion(): Region | undefined {
    return this._activeRegion;
  }

  private _invalidMarkers: InvalidMarker[] = [];
  private _onDidChangeInvalidMarkers = new vscode.EventEmitter<void>();
  readonly onDidChangeInvalidMarkers = this._onDidChangeInvalidMarkers.event;
  get invalidMarkers(): InvalidMarker[] {
    return this._invalidMarkers;
  }

  private _documentId: string | undefined = undefined;
  get documentId(): string | undefined {
    return this._documentId;
  }

  private _versionedDocumentId: string | undefined = undefined;
  get versionedDocumentId(): string | undefined {
    return this._versionedDocumentId;
  }
  // #endregion

  private debouncedRefreshRegionsAndActiveRegion = debounce(
    this.refreshRegionsAndActiveRegion.bind(this),
    REFRESH_REGIONS_DEBOUNCE_DELAY_MS
  );
  private isRefreshingRegions = false;

  private refreshActiveRegionTimeout: NodeJS.Timeout | undefined;

  private constructor(subscriptions: vscode.Disposable[]) {
    this.registerListeners(subscriptions);
    this.debouncedRefreshRegionsAndActiveRegion();
  }

  private registerListeners(subscriptions: vscode.Disposable[]): void {
    vscode.window.onDidChangeActiveTextEditor(
      this.debouncedRefreshRegionsAndActiveRegion,
      undefined,
      subscriptions
    );
    vscode.workspace.onDidChangeTextDocument(
      this.onDocumentChange.bind(this),
      undefined,
      subscriptions
    );
    vscode.window.onDidChangeTextEditorSelection(
      this.onSelectionChange.bind(this),
      undefined,
      subscriptions
    );
  }

  private onDocumentChange(event: vscode.TextDocumentChangeEvent): void {
    if (vscode.window.activeTextEditor?.document === event.document) {
      this.clearRefreshActiveRegionTimeoutIfExists();
      this.debouncedRefreshRegionsAndActiveRegion();
    }
  }

  private refreshRegionsAndActiveRegion(): void {
    this.refreshRegions();
    this.refreshActiveRegion();
  }

  private refreshRegions(): void {
    this.isRefreshingRegions = true;
    const activeDocument = vscode.window.activeTextEditor?.document;
    const activeDocumentId = activeDocument ? getDocumentId(activeDocument) : undefined;
    const versionedDocumentId = activeDocument ? getVersionedDocumentId(activeDocument) : undefined;
    let shouldFireChangeEvents: boolean;
    if (!activeDocument) {
      const oldFlattenedRegions = this._flattenedRegions;
      this._topLevelRegions = [];
      this._flattenedRegions = [];
      this._invalidMarkers = [];
      this._allParentIds = new Set<string>();
      shouldFireChangeEvents = oldFlattenedRegions.length > 0;
    } else {
      const { topLevelRegions, invalidMarkers } = parseAllRegions(activeDocument);
      this._topLevelRegions = topLevelRegions;
      const { flattenedRegions, allParentIds } = flattenRegionsAndCountParents(topLevelRegions);
      this._flattenedRegions = flattenedRegions;
      this._allParentIds = allParentIds;
      this._invalidMarkers = invalidMarkers;
      shouldFireChangeEvents = true; // TODO - can make this more precise if desired
    }
    this._documentId = activeDocumentId;
    this._versionedDocumentId = versionedDocumentId;
    if (shouldFireChangeEvents) {
      this._onDidChangeRegions.fire();
      this._onDidChangeInvalidMarkers.fire();
    }
    this.isRefreshingRegions = false;
  }

  // #region Refresh active region on selection change
  private onSelectionChange(event: vscode.TextEditorSelectionChangeEvent): void {
    if (this.isRefreshingRegions) {
      return;
    }
    if (event.textEditor === vscode.window.activeTextEditor) {
      this.debouncedRefreshActiveRegion();
    }
  }

  private debouncedRefreshActiveRegion(): void {
    this.clearRefreshActiveRegionTimeoutIfExists();
    this.refreshActiveRegionTimeout = setTimeout(
      this.refreshActiveRegion.bind(this),
      REFRESH_ACTIVE_REGION_DEBOUNCE_DELAY_MS
    );
  }

  private refreshActiveRegion(): void {
    this.clearRefreshActiveRegionTimeoutIfExists();
    const oldActiveRegion = this._activeRegion;
    this._activeRegion = getActiveRegion(this._topLevelRegions);
    if (this._activeRegion !== oldActiveRegion) {
      this._onDidChangeActiveRegion.fire();
    }
  }

  private clearRefreshActiveRegionTimeoutIfExists(): void {
    if (this.refreshActiveRegionTimeout) {
      clearTimeout(this.refreshActiveRegionTimeout);
      this.refreshActiveRegionTimeout = undefined;
    }
  }
  // #endregion
}

// function didFlattenedRegionsChange(
//   oldFlattenedRegions: FlattenedRegion[],
//   newFlattenedRegions: FlattenedRegion[]
// ): boolean {
//   if (oldFlattenedRegions.length !== newFlattenedRegions.length) {
//     return true;
//   }
//   for (let i = 0; i < oldFlattenedRegions.length; i++) {
//     const oldFlattenedRegion = oldFlattenedRegions[i];
//     const newFlattenedRegion = newFlattenedRegions[i];
//     if (
//       oldFlattenedRegion &&
//       newFlattenedRegion &&
//       !areFlattenedRegionsEqual(oldFlattenedRegion, newFlattenedRegion)
//     ) {
//       return true;
//     }
//   }
//   return false;
// }

// function areFlattenedRegionsEqual(region1: FlattenedRegion, region2: FlattenedRegion): boolean {
//   return (
//     region1.flatRegionIdx === region2.flatRegionIdx &&
//     region1.name === region2.name &&
//     region1.startLineIdx === region2.startLineIdx &&
//     region1.endLineIdx === region2.endLineIdx &&
//     region1.endLineCharacterIdx === region2.endLineCharacterIdx &&
//     region1.wasClosed === region2.wasClosed
//   );
// }
