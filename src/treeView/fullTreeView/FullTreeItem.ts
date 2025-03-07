import * as vscode from "vscode";
import { getRangeText, getRegionDisplayName } from "../../lib/getRegionDisplayInfo";
import { type Region } from "../../models/Region";
import { getSymbolThemeIcon } from "../../utils/themeIconUtils";
import { makeGoToFullTreeItemCommand } from "./goToFullTreeItem";

export type FullTreeItemType = "region" | "symbol";

export class FullTreeItem extends vscode.TreeItem {
  displayName: string;
  itemType: FullTreeItemType;
  range: vscode.Range;
  parent: FullTreeItem | undefined;
  children: FullTreeItem[];

  constructor({
    displayName,
    range,
    itemType,
    parent,
    children,
    icon,
  }: {
    displayName: string;
    range: vscode.Range;
    itemType: FullTreeItemType;
    parent: FullTreeItem | undefined;
    children: FullTreeItem[];
    icon: vscode.ThemeIcon | undefined;
  }) {
    super(displayName, getInitialCollapsibleState(children));
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

/**
 * Turns a flattened region into a `FullTreeItem` object (no parent or children yet, since we'll
 * manually add those later when generating the full tree).
 */
export function getFlattenedRegionFullTreeItem(region: Region): FullTreeItem {
  return getFlattenedFullTreeItem({
    displayName: getRegionDisplayName(region),
    range: new vscode.Range(region.startLineIdx, 0, region.endLineIdx, region.endLineCharacterIdx),
    itemType: "region",
    icon: new vscode.ThemeIcon("symbol-namespace"),
  });
}

/**
 * Turns a flattened symbol into a `FullTreeItem` object (no parent or children yet, since we'll
 * manually add those later when generating the full tree).
 */
export function getFlattenedSymbolFullTreeItem(symbol: vscode.DocumentSymbol): FullTreeItem {
  const maybeThemeIcon = getSymbolThemeIcon(symbol.kind);
  return getFlattenedFullTreeItem({
    displayName: symbol.name,
    range: symbol.range,
    itemType: "symbol",
    icon: maybeThemeIcon,
  });
}

function getFlattenedFullTreeItem({
  itemType,
  displayName,
  range,
  icon,
}: {
  itemType: FullTreeItemType;
  displayName: string;
  range: vscode.Range;
  icon: vscode.ThemeIcon | undefined;
}): FullTreeItem {
  const parent = undefined;
  const children: FullTreeItem[] = [];
  return new FullTreeItem({ displayName, range, itemType, parent, children, icon });
}
