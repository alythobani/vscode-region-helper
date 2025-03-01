import { type FullTreeItem } from "./FullTreeItem";

export function mergeRegionsAndSymbols({
  flattenedRegionItems,
  flattenedSymbolItems,
}: {
  flattenedRegionItems: FullTreeItem[];
  flattenedSymbolItems: FullTreeItem[];
}): FullTreeItem[] {
  const sortedFullTreeItems = mergeFlattenedRegionAndSymbolTreeItems({
    flattenedRegionItems,
    flattenedSymbolItems,
  });

  const mergedTreeRoots: FullTreeItem[] = [];
  const parentStack: FullTreeItem[] = [];
  // Build the hierarchical tree structure
  for (const treeItem of sortedFullTreeItems) {
    // Remove parents that are no longer valid (i.e., this item is outside their range)
    let currentParent = parentStack[parentStack.length - 1];
    for (
      ;
      currentParent !== undefined && !currentParent.range.contains(treeItem.range);
      currentParent = parentStack[parentStack.length - 1]
    ) {
      parentStack.pop();
    }
    if (currentParent !== undefined) {
      // Assign this item as a child of the most recent valid parent
      currentParent.children.push(treeItem);
      treeItem.parent = currentParent;
    } else {
      // No valid parent found → this is a top-level item
      mergedTreeRoots.push(treeItem);
    }
    // Push this item onto the stack (it may become a parent for future items)
    parentStack.push(treeItem);
  }
  return mergedTreeRoots;
}

/**
 * Merges the flattened (and sorted within themselves) region and symbol tree items into a single
 * sorted list in O(n).
 */
function mergeFlattenedRegionAndSymbolTreeItems({
  flattenedRegionItems,
  flattenedSymbolItems,
}: {
  flattenedRegionItems: FullTreeItem[];
  flattenedSymbolItems: FullTreeItem[];
}): FullTreeItem[] {
  // Merge the two sorted lists in O(n)
  const sortedFullTreeItems: FullTreeItem[] = [];
  for (
    let regionIdx = 0,
      symbolIdx = 0,
      regionItem = flattenedRegionItems[regionIdx],
      symbolItem = flattenedSymbolItems[symbolIdx];
    regionItem !== undefined || symbolItem !== undefined;
    regionItem = flattenedRegionItems[regionIdx], symbolItem = flattenedSymbolItems[symbolIdx]
  ) {
    if (regionItem === undefined) {
      // Append the remaining symbol items
      sortedFullTreeItems.push(...flattenedSymbolItems.slice(symbolIdx));
      break;
    }
    if (symbolItem === undefined) {
      // Append the remaining region items
      sortedFullTreeItems.push(...flattenedRegionItems.slice(regionIdx));
      break;
    }
    if (regionItem.range.start.isBefore(symbolItem.range.start)) {
      sortedFullTreeItems.push(regionItem);
      regionIdx++;
    } else {
      sortedFullTreeItems.push(symbolItem);
      symbolIdx++;
    }
  }
  return sortedFullTreeItems;
}
