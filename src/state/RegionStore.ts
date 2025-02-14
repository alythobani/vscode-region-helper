import * as vscode from "vscode";
import { parseAllRegions } from "../lib/parseAllRegions";
import { type Region } from "../models/Region";

export class RegionStore {
  private _topLevelRegions: Region[] = [];
  private _onDidChangeRegions = new vscode.EventEmitter<void>();
  readonly onDidChangeRegions = this._onDidChangeRegions.event;

  constructor(subscriptions: vscode.Disposable[]) {
    this.registerListeners(subscriptions);
    this.refresh();
  }

  private registerListeners(subscriptions: vscode.Disposable[]): void {
    this.registerActiveTextEditorChangeListener(subscriptions);
    this.registerDocumentChangeListener(subscriptions);
  }

  private registerActiveTextEditorChangeListener(subscriptions: vscode.Disposable[]): void {
    vscode.window.onDidChangeActiveTextEditor(() => this.refresh(), undefined, subscriptions);
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
      this.refresh();
    }
  }

  private refresh(): void {
    const activeDocument = vscode.window.activeTextEditor?.document;
    this._topLevelRegions = activeDocument ? parseAllRegions(activeDocument).topLevelRegions : [];
    this._onDidChangeRegions.fire();
  }

  get topLevelRegions(): Region[] {
    return this._topLevelRegions;
  }
}
