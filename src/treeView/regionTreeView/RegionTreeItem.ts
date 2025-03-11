import * as vscode from "vscode";
import { getRegionDisplayName, getRegionRangeText } from "../../lib/getRegionDisplayInfo";
import { type Region } from "../../models/Region";
import { goToRegionTreeItemCommand } from "./goToRegionTreeItem";

export class RegionTreeItem extends vscode.TreeItem {
  constructor(public readonly region: Region) {
    const displayName = getRegionDisplayName(region);
    super(
      displayName,
      region.children.length > 0
        ? vscode.TreeItemCollapsibleState.Expanded
        : vscode.TreeItemCollapsibleState.None
    );
    this.tooltip = `${displayName}: ${getRegionRangeText(region)}`;
    this.command = {
      command: goToRegionTreeItemCommand.id,
      title: "Go to Region",
      arguments: [region.startLineIdx],
    };
    this.iconPath = new vscode.ThemeIcon("symbol-namespace");
  }
}
