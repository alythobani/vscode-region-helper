import * as vscode from "vscode";
import { type Region } from "../models/Region";
import { goToRegionCommandId } from "./goToRegion";

export class RegionTreeItem extends vscode.TreeItem {
  constructor(public readonly region: Region) {
    super(
      region.name ?? "Unnamed Region",
      region.children.length > 0
        ? vscode.TreeItemCollapsibleState.Expanded
        : vscode.TreeItemCollapsibleState.None
    );
    this.tooltip = `Region from line ${region.startLineIdx} to line ${region.endLineIdx}`;
    this.command = {
      command: goToRegionCommandId,
      title: "Go to Region",
      arguments: [region.startLineIdx],
    };
  }
}
