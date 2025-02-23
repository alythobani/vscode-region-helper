import * as vscode from "vscode";
import { getRangeText, getRegionDisplayName } from "../lib/getRegionDisplayInfo";
import { type Region } from "../models/Region";
import { goToFullTreeItemCommandId } from "./goToFullTreeItem";

export class FullTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly range: vscode.Range,
    public readonly type: "region" | "symbol",
    public parent: FullTreeItem | undefined,
    public readonly children: FullTreeItem[],
    public readonly icon?: vscode.ThemeIcon
  ) {
    super(
      label,
      children.length > 0
        ? vscode.TreeItemCollapsibleState.Expanded
        : vscode.TreeItemCollapsibleState.None
    );
    this.tooltip = `${label}: ${getRangeText(range)}`;
    this.command = {
      command: goToFullTreeItemCommandId,
      title: "Go to Item",
      arguments: [range.start.line, type === "region" ? undefined : range.start.character],
    };
    if (icon) this.iconPath = icon;
  }
}

export function getRegionFullTreeItem(region: Region, parent?: FullTreeItem): FullTreeItem {
  const item = new FullTreeItem(
    getRegionDisplayName(region),
    new vscode.Range(region.startLineIdx, 0, region.endLineIdx, 0),
    "region",
    parent,
    region.children.map((child) => getRegionFullTreeItem(child, parent)),
    new vscode.ThemeIcon("symbol-namespace")
  );
  return item;
}

export function getSymbolFullTreeItem(
  symbol: vscode.DocumentSymbol,
  parent?: FullTreeItem
): FullTreeItem {
  const item = new FullTreeItem(
    symbol.name,
    symbol.range,
    "symbol",
    parent,
    symbol.children.map((child) => getSymbolFullTreeItem(child, parent)),
    new vscode.ThemeIcon("symbol-" + vscode.SymbolKind[symbol.kind].toLowerCase())
  );
  return item;
}
