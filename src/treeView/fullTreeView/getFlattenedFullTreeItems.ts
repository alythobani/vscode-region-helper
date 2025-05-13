import * as vscode from "vscode";
import { getRegionDisplayName } from "../../lib/getRegionDisplayInfo";
import { getRegionRange } from "../../lib/getRegionRange";
import { type Region } from "../../models/Region";
import { getSymbolThemeIcon, getSymbolThemeIconId } from "../../utils/themeIconUtils";
import { FullTreeItem, type FullTreeItemType } from "./FullTreeItem";

/**
 * Creates a flattened list of region items for the Full Outline tree view, given a flattened list
 * of regions. Turns each region into a `FullTreeItem` object, with no parent or children yet, since
 * we'll manually add those later when generating the full tree. Gives a unique ID to each item, for
 * the sake of persistent collapsed/selected state (see `vscode.TreeItem.id`).
 */
export function getFlattenedRegionFullTreeItems(flattenedRegions: Region[]): FullTreeItem[] {
  const itemCountByPartialId = new Map<string, number>();
  return flattenedRegions.map((region) => {
    const displayName = getRegionDisplayName(region);
    const itemType = "region";
    const partialId = getPartialTreeItemId({ displayName, itemKindId: itemType });
    const newItemCount = (itemCountByPartialId.get(partialId) ?? 0) + 1;
    itemCountByPartialId.set(partialId, newItemCount);
    const id = getUniqueTreeItemId({ partialId, itemCount: newItemCount });
    return getFlattenedFullTreeItem({
      id,
      displayName,
      range: getRegionRange(region),
      itemType,
      icon: new vscode.ThemeIcon("symbol-namespace"),
    });
  });
}

/**
 * Creates a flattened list of symbol items for the Full Outline tree view, given a flattened
 * list of document symbols. Turns each symbol into a `FullTreeItem` object, with no parent or children yet,
 * since we'll manually add those later when generating the full tree. Gives a unique ID to each item, for
 * the sake of persistent collapsed/selected state (see `vscode.TreeItem.id`).
 */
export function getFlattenedSymbolFullTreeItems(
  flattenedDocumentSymbols: vscode.DocumentSymbol[]
): FullTreeItem[] {
  const itemCountByPartialId = new Map<string, number>();
  return flattenedDocumentSymbols.map((symbol) => {
    const displayName = symbol.name;
    const symbolThemeIconId = getSymbolThemeIconId(symbol.kind);
    const partialId = getPartialTreeItemId({ displayName, itemKindId: symbolThemeIconId });
    const newItemCount = (itemCountByPartialId.get(partialId) ?? 0) + 1;
    itemCountByPartialId.set(partialId, newItemCount);
    const id = getUniqueTreeItemId({ partialId, itemCount: newItemCount });
    const maybeThemeIcon = getSymbolThemeIcon(symbolThemeIconId);
    return getFlattenedFullTreeItem({
      id,
      displayName: symbol.name,
      range: symbol.range,
      itemType: "symbol",
      icon: maybeThemeIcon,
    });
  });
}

/**
 * Generates a partial (potentially non-unique) ID for a tree item, based on its display name and an
 * identifier for the item kind (e.g. "region" or "symbol-boolean").
 */
function getPartialTreeItemId({
  displayName,
  itemKindId,
}: {
  displayName: string;
  itemKindId: string;
}): string {
  return `${itemKindId}-${displayName}`;
}

/**
 * Generates a unique ID for a tree item, based on its partial ID and the number of items so far
 * with that same partial ID. This is used to ensure unique IDs across the tree.
 */
function getUniqueTreeItemId({
  partialId,
  itemCount,
}: {
  partialId: string;
  itemCount: number;
}): string {
  return `${partialId}-${itemCount}`;
}

function getFlattenedFullTreeItem({
  id,
  itemType,
  displayName,
  range,
  icon,
}: {
  id: string;
  itemType: FullTreeItemType;
  displayName: string;
  range: vscode.Range;
  icon: vscode.ThemeIcon | undefined;
}): FullTreeItem {
  const parent = undefined;
  const children: FullTreeItem[] = [];
  return new FullTreeItem({ id, displayName, range, itemType, parent, children, icon });
}
