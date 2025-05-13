import * as vscode from "vscode";
import { getRangeText } from "../../lib/getRegionDisplayInfo";
import { makeGoToFullTreeItemCommand } from "./goToFullTreeItem";

export type FullTreeItemType = "region" | "symbol";

export class FullTreeItem extends vscode.TreeItem {
  displayName: string;
  itemType: FullTreeItemType;
  range: vscode.Range;
  parent: FullTreeItem | undefined;
  children: FullTreeItem[];

  constructor({
    id,
    displayName,
    range,
    itemType,
    parent,
    children,
    icon,
  }: {
    id: string;
    displayName: string;
    range: vscode.Range;
    itemType: FullTreeItemType;
    parent: FullTreeItem | undefined;
    children: FullTreeItem[];
    icon: vscode.ThemeIcon | undefined;
  }) {
    super(displayName, getInitialCollapsibleState(children));
    this.id = id;
    this.displayName = displayName;
    this.itemType = itemType;
    this.tooltip = `${displayName}: ${getRangeText(range)}`;
    this.command = makeGoToFullTreeItemCommand(itemType, range);
    this.parent = parent;
    this.children = children;
    this.range = range;
    if (icon) this.iconPath = icon;
  }
}

function getInitialCollapsibleState(children: FullTreeItem[]): vscode.TreeItemCollapsibleState {
  return children.length > 0
    ? vscode.TreeItemCollapsibleState.Expanded
    : vscode.TreeItemCollapsibleState.None;
}
