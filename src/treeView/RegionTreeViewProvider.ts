import * as vscode from "vscode";
import { parseAllRegions } from "../lib/parseAllRegions";
import { type Region } from "../models/Region";
import { RegionTreeItem } from "./RegionTreeItem";

export class RegionTreeViewProvider implements vscode.TreeDataProvider<Region> {
  private _onDidChangeTreeData = new vscode.EventEmitter<Region | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private topLevelRegions: Region[] = [];

  private treeView: vscode.TreeView<Region> | undefined;

  constructor() {
    this.refreshIfActiveDocumentExists();
    this.registerListeners();
  }

  private refreshIfActiveDocumentExists(): void {
    const activeDocument = vscode.window.activeTextEditor?.document;
    if (activeDocument) {
      this.refresh(activeDocument);
    }
  }

  private registerListeners(): void {
    this.registerActiveTextEditorListener();
    this.registerDocumentChangeListener();
    this.registerSelectionChangeListener();
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

  private registerSelectionChangeListener(): void {
    vscode.window.onDidChangeTextEditorSelection((event) => {
      if (event.textEditor === vscode.window.activeTextEditor) {
        this.highlightActiveRegion();
      }
    });
  }

  refresh(document: vscode.TextDocument): void {
    this.topLevelRegions = parseAllRegions(document).topLevelRegions;
    this._onDidChangeTreeData.fire(undefined);
    this.highlightActiveRegion();
  }

  getTreeItem(region: Region): vscode.TreeItem {
    return new RegionTreeItem(region);
  }

  getParent(element: Region): vscode.ProviderResult<Region> {
    return element.parent;
  }

  getChildren(element?: Region): Region[] {
    return element ? element.children : this.topLevelRegions;
  }

  setTreeView(treeView: vscode.TreeView<Region>): void {
    this.treeView = treeView;
  }

  private highlightActiveRegion(): void {
    if (!this.treeView || !vscode.window.activeTextEditor) {
      return;
    }
    const cursorLine = vscode.window.activeTextEditor.selection.active.line;
    const activeRegion = this.findEnclosingRegion(this.topLevelRegions, cursorLine);
    if (!activeRegion) {
      return;
    }
    this.treeView.reveal(activeRegion, { select: true, focus: false });
  }

  private findEnclosingRegion(regions: Region[], cursorLine: number): Region | undefined {
    for (const region of regions) {
      if (cursorLine >= region.startLineIdx && cursorLine <= region.endLineIdx) {
        // Recursively check if there's a more specific sub-region
        return this.findEnclosingRegion(region.children, cursorLine) ?? region;
      }
    }
    return undefined;
  }
}
