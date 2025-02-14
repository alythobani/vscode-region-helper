import * as vscode from "vscode";
import { parseAllRegions } from "../lib/parseAllRegions";
import { type Region } from "../models/Region";

export class RegionStore {
  private _topLevelRegions: Region[] = [];
  private _onDidChangeRegions = new vscode.EventEmitter<void>();
  readonly onDidChangeRegions = this._onDidChangeRegions.event;

  constructor() {
    this.registerListeners();
    this.refresh();
  }

  private registerListeners(): void {
    vscode.window.onDidChangeActiveTextEditor(() => this.refresh());
    vscode.workspace.onDidChangeTextDocument((event) => {
      if (vscode.window.activeTextEditor?.document === event.document) {
        this.refresh();
      }
    });
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
