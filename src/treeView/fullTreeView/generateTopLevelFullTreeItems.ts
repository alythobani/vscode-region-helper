import * as vscode from "vscode";
import { assertExists } from "../../utils/assertUtils";
import { type FullTreeItem } from "./FullTreeItem";

export function generateTopLevelFullTreeItems({
  flattenedRegionItems,
  flattenedSymbolItems,
}: {
  flattenedRegionItems: FullTreeItem[];
  flattenedSymbolItems: FullTreeItem[];
}): FullTreeItem[] {
  const topLevelFullTreeItems: FullTreeItem[] = [];
  const parentStack: FullTreeItem[] = [];

  let regionIdx = 0;
  let symbolIdx = 0;

  for (
    let regionItem = flattenedRegionItems[regionIdx], symbolItem = flattenedSymbolItems[symbolIdx];
    regionItem !== undefined || symbolItem !== undefined;
    regionItem = flattenedRegionItems[regionIdx], symbolItem = flattenedSymbolItems[symbolIdx]
  ) {
    let nextItem: FullTreeItem;
    if (regionItem === undefined) {
      assertExists(symbolItem);
      nextItem = symbolItem;
      symbolIdx++;
    } else if (symbolItem === undefined) {
      assertExists(regionItem);
      nextItem = regionItem;
      regionIdx++;
    } else if (regionItem.range.start.isBefore(symbolItem.range.start)) {
      nextItem = regionItem;
      regionIdx++;
    } else {
      nextItem = symbolItem;
      symbolIdx++;
    }

    nextItem.children = [];
    nextItem.collapsibleState = vscode.TreeItemCollapsibleState.None;

    // Remove parents that are no longer valid (i.e., this item is outside their range)
    let currentParent = parentStack[parentStack.length - 1];
    while (currentParent !== undefined && !currentParent.range.contains(nextItem.range)) {
      parentStack.pop();
      currentParent = parentStack[parentStack.length - 1];
    }

    if (currentParent !== undefined) {
      // Attach as a child of the most recent valid parent
      currentParent.children.push(nextItem);
      currentParent.collapsibleState = vscode.TreeItemCollapsibleState.Expanded;
      nextItem.parent = currentParent;
    } else {
      // No valid parent found → this is a top-level item
      topLevelFullTreeItems.push(nextItem);
    }

    // Push onto stack (it may become a parent for future items)
    parentStack.push(nextItem);
  }

  return topLevelFullTreeItems;
}
