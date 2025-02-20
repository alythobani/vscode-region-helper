import * as vscode from "vscode";
import { type InvalidMarker, parseAllRegions } from "../lib/parseAllRegions";
import { type Region } from "../models/Region";
import { getActiveRegion } from "../utils/getActiveRegion";

export class RegionStore {
  private _topLevelRegions: Region[] = [];
  private _invalidMarkers: InvalidMarker[] = [];
  private _onDidChangeRegions = new vscode.EventEmitter<void>();
  readonly onDidChangeRegions = this._onDidChangeRegions.event;

  private _activeRegion: Region | undefined = undefined;
  private _onDidChangeActiveRegion = new vscode.EventEmitter<void>();
  readonly onDidChangeActiveRegion = this._onDidChangeActiveRegion.event;

  private _onDidChangeInvalidMarkers = new vscode.EventEmitter<void>();
  readonly onDidChangeInvalidMarkers = this._onDidChangeInvalidMarkers.event;

  constructor(subscriptions: vscode.Disposable[]) {
    this.registerListeners(subscriptions);
    this.refreshRegionsAndActiveRegion();
  }

  private registerListeners(subscriptions: vscode.Disposable[]): void {
    this.registerActiveTextEditorChangeListener(subscriptions);
    this.registerDocumentChangeListener(subscriptions);
    this.registerSelectionChangeListener(subscriptions);
  }

  private registerActiveTextEditorChangeListener(subscriptions: vscode.Disposable[]): void {
    vscode.window.onDidChangeActiveTextEditor(
      () => this.refreshRegionsAndActiveRegion(),
      undefined,
      subscriptions
    );
  }

  private registerDocumentChangeListener(subscriptions: vscode.Disposable[]): void {
    vscode.workspace.onDidChangeTextDocument(
      (event) => this.onDocumentChange(event),
      undefined,
      subscriptions
    );
  }

  private onDocumentChange(event: vscode.TextDocumentChangeEvent): void {
    if (vscode.window.activeTextEditor?.document === event.document) {
      this.refreshRegionsAndActiveRegion();
    }
  }

  private registerSelectionChangeListener(subscriptions: vscode.Disposable[]): void {
    vscode.window.onDidChangeTextEditorSelection(
      (event) => this.onSelectionChange(event),
      undefined,
      subscriptions
    );
  }

  private onSelectionChange(event: vscode.TextEditorSelectionChangeEvent): void {
    if (event.textEditor === vscode.window.activeTextEditor) {
      this.refreshActiveRegion();
    }
  }

  private refreshRegionsAndActiveRegion(): void {
    this.refreshRegions();
    this.refreshActiveRegion();
  }

  private refreshRegions(): void {
    const activeDocument = vscode.window.activeTextEditor?.document;
    if (!activeDocument) {
      this._topLevelRegions = [];
      this._invalidMarkers = [];
    } else {
      const { topLevelRegions, invalidMarkers } = parseAllRegions(activeDocument);
      this._topLevelRegions = topLevelRegions;
      this._invalidMarkers = invalidMarkers;
    }
    this._onDidChangeRegions.fire();
    this._onDidChangeInvalidMarkers.fire(); // Notify diagnostics manager of invalid markers
  }

  private refreshActiveRegion(): void {
    const oldActiveRegion = this._activeRegion;
    this._activeRegion = getActiveRegion(this._topLevelRegions);
    if (this._activeRegion !== oldActiveRegion) {
      this._onDidChangeActiveRegion.fire();
    }
  }

  get topLevelRegions(): Region[] {
    return this._topLevelRegions;
  }

  get activeRegion(): Region | undefined {
    return this._activeRegion;
  }

  get invalidMarkers(): InvalidMarker[] {
    return this._invalidMarkers;
  }
}
