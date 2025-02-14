import * as vscode from "vscode";
import { parseAllRegions } from "../lib/parseAllRegions";
import { type Region } from "../models/Region";
import { RegionTreeItem } from "./RegionTreeItem";

export class RegionTreeViewProvider implements vscode.TreeDataProvider<Region> {
  private _onDidChangeTreeData = new vscode.EventEmitter<Region | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private topLevelRegions: Region[] = [];

  constructor() {
    this.refreshIfActiveDocumentExists();
    this.registerActiveTextEditorListener();
    this.registerDocumentChangeListener();
  }

  private refreshIfActiveDocumentExists(): void {
    const activeDocument = vscode.window.activeTextEditor?.document;
    if (activeDocument) {
      this.refresh(activeDocument);
    }
  }

  private registerActiveTextEditorListener(): void {
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) {
        this.refresh(editor.document);
      }
    });
  }

  private registerDocumentChangeListener(): void {
    vscode.workspace.onDidChangeTextDocument((event) => {
      if (vscode.window.activeTextEditor?.document === event.document) {
        this.refresh(event.document);
      }
    });
  }

  refresh(document: vscode.TextDocument): void {
    this.topLevelRegions = parseAllRegions(document).topLevelRegions;
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(region: Region): vscode.TreeItem {
    return new RegionTreeItem(region);
  }

  getChildren(element?: Region): Region[] {
    return element ? element.children : this.topLevelRegions;
  }
}
