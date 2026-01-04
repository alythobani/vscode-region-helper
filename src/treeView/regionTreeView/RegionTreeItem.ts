import * as vscode from "vscode";
import { getRegionDisplayName, getRegionRangeText } from "../../lib/getRegionDisplayInfo";
import { type Region } from "../../models/Region";
import { goToRegionTreeItemCommand } from "./goToRegionTreeItem";

export class RegionTreeItem extends vscode.TreeItem {
  constructor(
    public readonly region: Region,
    initialCollapsibleState: vscode.TreeItemCollapsibleState
  ) {
    const displayName = getRegionDisplayName(region);
    super(displayName, initialCollapsibleState);
    this.id = region.id;
    this.tooltip = `${displayName}: ${getRegionRangeText(region)}`;
    this.command = {
      command: goToRegionTreeItemCommand.id,
      title: "Go to Region",
      arguments: [region.range.start.line],
    };
    this.iconPath = new vscode.ThemeIcon("symbol-namespace");
  }
}
