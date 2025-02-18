import * as vscode from "vscode";
import { parseAllRegions } from "../lib/parseAllRegions";
import { type Region } from "../models/Region";
import { getActiveRegion } from "../utils/getActiveRegion";

export class RegionStore {
  private _topLevelRegions: Region[] = [];
  private _onDidChangeRegions = new vscode.EventEmitter<void>();
  readonly onDidChangeRegions = this._onDidChangeRegions.event;

  private _currentActiveRegion: Region | undefined = undefined;
  private _onDidChangeActiveRegion = new vscode.EventEmitter<void>();
  readonly onDidChangeActiveRegion = this._onDidChangeActiveRegion.event;

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
    this._topLevelRegions = activeDocument ? parseAllRegions(activeDocument).topLevelRegions : [];
    this._onDidChangeRegions.fire();
  }

  private refreshActiveRegion(): void {
    const oldActiveRegion = this._currentActiveRegion;
    this._currentActiveRegion = getActiveRegion(this._topLevelRegions);
    if (this._currentActiveRegion !== oldActiveRegion) {
      this._onDidChangeActiveRegion.fire();
    }
  }

  get topLevelRegions(): Region[] {
    return this._topLevelRegions;
  }

  get currentActiveRegion(): Region | undefined {
    return this._currentActiveRegion;
  }
}
