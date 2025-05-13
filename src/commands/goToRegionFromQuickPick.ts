import * as vscode from "vscode";
import { getRegionDisplayName, getRegionRangeText } from "../lib/getRegionDisplayInfo";
import { getRegionParents } from "../lib/getRegionParents";
import { type Region } from "../models/Region";
import {
  clearHighlightedRegions,
  highlightAndScrollRegionIntoView,
} from "../utils/highlightRegion";
import { moveCursorToFirstNonWhitespaceCharOfLine } from "../utils/moveCursorToFirstNonWhitespaceOfLine";
import { scrollCurrentLineIntoView } from "../utils/scrollUtils";
import { type RegionHelperStoreParams, type RegionHelperStoresCommand } from "./registerCommand";

type RegionQuickPickItem = vscode.QuickPickItem & { startLineIdx: number; endLineIdx: number };

export const goToRegionFromQuickPickCommand: RegionHelperStoresCommand = {
  id: "regionHelper.goToRegionFromQuickPick",
  callback: goToRegionFromQuickPick,
  needsStoreParams: true,
};

function goToRegionFromQuickPick({ regionStore }: RegionHelperStoreParams): void {
  const { activeTextEditor } = vscode.window;
  if (!activeTextEditor) {
    return;
  }

  const regionQuickPick = vscode.window.createQuickPick<RegionQuickPickItem>();
  const { topLevelRegions, activeRegion } = regionStore;
  const regionQuickPickItems = getRegionQuickPickItems(topLevelRegions);
  const initialActiveItem = getActiveRegionQuickPickItem({ activeRegion, regionQuickPickItems });
  initializeRegionQuickPick({
    regionQuickPick,
    regionQuickPickItems,
    initialActiveItem,
    activeTextEditor,
  });
  regionQuickPick.show();
  if (initialActiveItem) {
    highlightAndScrollItemIntoView({ regionQuickPickItem: initialActiveItem, activeTextEditor });
  }
}

function getRegionQuickPickItems(regions: Region[]): RegionQuickPickItem[] {
  return regions.flatMap((region) => {
    const regionQuickPickItem = makeRegionQuickPickItem(region);
    return [regionQuickPickItem, ...getRegionQuickPickItems(region.children)];
  });
}

function makeRegionQuickPickItem(region: Region): RegionQuickPickItem {
  const { startLineIdx, endLineIdx } = region;
  const label = getRegionQuickPickItemLabel(region);
  const description = getRegionRangeText(region);
  return { label, description, startLineIdx, endLineIdx };
}

function getRegionQuickPickItemLabel(region: Region): string {
  const displayName = getRegionDisplayName(region);
  const parents = getRegionParents(region);
  const numParents = parents.length;
  const indent = "  ".repeat(numParents);
  return `${indent}${displayName}`;
}

function getActiveRegionQuickPickItem({
  activeRegion,
  regionQuickPickItems,
}: {
  activeRegion: Region | undefined;
  regionQuickPickItems: RegionQuickPickItem[];
}): RegionQuickPickItem | undefined {
  return activeRegion
    ? regionQuickPickItems.find((item) => item.startLineIdx === activeRegion.startLineIdx)
    : regionQuickPickItems[0];
}

function initializeRegionQuickPick({
  regionQuickPick,
  regionQuickPickItems,
  initialActiveItem,
  activeTextEditor,
}: {
  regionQuickPick: vscode.QuickPick<RegionQuickPickItem>;
  regionQuickPickItems: RegionQuickPickItem[];
  initialActiveItem: RegionQuickPickItem | undefined;
  activeTextEditor: vscode.TextEditor;
}): void {
  regionQuickPick.items = regionQuickPickItems;
  regionQuickPick.placeholder = getRegionQuickPickPlaceholder(regionQuickPickItems);
  regionQuickPick.matchOnDescription = true;
  regionQuickPick.canSelectMany = false;
  regionQuickPick.activeItems = initialActiveItem ? [initialActiveItem] : [];
  regionQuickPick.onDidHide(() => onDidHideQuickPick({ regionQuickPick, activeTextEditor }));
  regionQuickPick.onDidChangeActive((items) =>
    onDidChangeActiveQuickPickItems(items, activeTextEditor)
  );
  regionQuickPick.onDidAccept(() => onDidAcceptQuickPickItem(regionQuickPick, activeTextEditor));
}

function getRegionQuickPickPlaceholder(regionQuickPickItems: RegionQuickPickItem[]): string {
  return regionQuickPickItems.length > 0
    ? "Search for a region to jump to"
    : "No regions available";
}

function onDidHideQuickPick({
  regionQuickPick,
  activeTextEditor,
}: {
  regionQuickPick: vscode.QuickPick<RegionQuickPickItem>;
  activeTextEditor: vscode.TextEditor;
}): void {
  regionQuickPick.dispose();
  clearHighlightedRegions(activeTextEditor);
  scrollCurrentLineIntoView({
    editor: activeTextEditor,
    revealType: vscode.TextEditorRevealType.InCenter,
  });
}

function onDidChangeActiveQuickPickItems(
  items: readonly RegionQuickPickItem[],
  activeTextEditor: vscode.TextEditor
): void {
  const activeItem = items[0];
  if (!activeItem) {
    return;
  }
  highlightAndScrollItemIntoView({ regionQuickPickItem: activeItem, activeTextEditor });
}

function onDidAcceptQuickPickItem(
  regionQuickPick: vscode.QuickPick<RegionQuickPickItem>,
  activeTextEditor: vscode.TextEditor
): void {
  const acceptedItem = regionQuickPick.selectedItems[0];
  regionQuickPick.dispose();
  clearHighlightedRegions(activeTextEditor);
  if (!acceptedItem) {
    scrollCurrentLineIntoView({
      editor: activeTextEditor,
      revealType: vscode.TextEditorRevealType.InCenter,
    });
    return;
  }
  moveCursorToFirstNonWhitespaceCharOfLine({
    activeTextEditor,
    lineIdx: acceptedItem.startLineIdx,
    revealType: vscode.TextEditorRevealType.InCenter,
  });
}

function highlightAndScrollItemIntoView({
  regionQuickPickItem,
  activeTextEditor,
}: {
  regionQuickPickItem: RegionQuickPickItem;
  activeTextEditor: vscode.TextEditor;
}): void {
  const { startLineIdx, endLineIdx } = regionQuickPickItem;
  highlightAndScrollRegionIntoView({
    activeTextEditor,
    startLineIdx,
    endLineIdx,
    revealType: vscode.TextEditorRevealType.InCenter,
  });
}
