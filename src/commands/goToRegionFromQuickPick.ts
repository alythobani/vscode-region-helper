import * as vscode from "vscode";
import { type Region } from "../models/Region";
import { type RegionStore } from "../state/RegionStore";
import { getCursorActiveLineIdx } from "../utils/getCursorActiveLineIdx";
import { getCursorActiveRegion } from "../utils/getCursorActiveRegion";
import {
  clearHighlightedRegions,
  highlightAndScrollRegionIntoView,
} from "../utils/highlightRegion";
import { moveCursorToFirstNonWhitespaceCharOfLine } from "../utils/moveCursorToFirstNonWhitespaceOfLine";
import { scrollCurrentLineIntoView } from "../utils/scrollUtils";

type RegionQuickPickItem = vscode.QuickPickItem & { startLineIdx: number; endLineIdx: number };

export const goToRegionFromQuickPickCommandId = "region-helper.goToRegionFromQuickPick";

export function goToRegionFromQuickPick(
  regionStore: RegionStore,
  subscriptions: vscode.Disposable[]
): void {
  const { activeTextEditor } = vscode.window;
  if (!activeTextEditor) {
    return;
  }

  const regionQuickPick = vscode.window.createQuickPick<RegionQuickPickItem>();
  const { topLevelRegions } = regionStore;
  const regionQuickPickItems = getRegionQuickPickItems(topLevelRegions);
  const initialActiveItem = getCurrentActiveRegionQuickPickItem({
    topLevelRegions,
    regionQuickPickItems,
    activeTextEditor,
  });
  initializeRegionQuickPick({
    regionQuickPick,
    regionQuickPickItems,
    initialActiveItem,
    activeTextEditor,
    subscriptions,
  });
  regionQuickPick.show();
  if (initialActiveItem) {
    highlightAndScrollItemIntoView(initialActiveItem, activeTextEditor);
  }
}

function getRegionQuickPickItems(regions: Region[]): RegionQuickPickItem[] {
  return regions.flatMap((region) => {
    const regionQuickPickItem = makeRegionQuickPickItem(region);
    return [regionQuickPickItem, ...getRegionQuickPickItems(region.children)];
  });
}

function makeRegionQuickPickItem(region: Region): RegionQuickPickItem {
  const label = region.name ?? "(Unnamed Region)";
  const { startLineIdx, endLineIdx } = region;
  const description = `Line ${startLineIdx + 1} to ${endLineIdx + 1}`;
  return { label, description, startLineIdx, endLineIdx };
}

function getCurrentActiveRegionQuickPickItem({
  topLevelRegions,
  regionQuickPickItems,
  activeTextEditor,
}: {
  topLevelRegions: Region[];
  regionQuickPickItems: RegionQuickPickItem[];
  activeTextEditor: vscode.TextEditor;
}): RegionQuickPickItem | undefined {
  const currentLineIdx = getCursorActiveLineIdx(activeTextEditor);
  const currentActiveRegion = getCursorActiveRegion(topLevelRegions, currentLineIdx);
  return currentActiveRegion
    ? regionQuickPickItems.find((item) => item.startLineIdx === currentActiveRegion.startLineIdx)
    : regionQuickPickItems[0];
}

function initializeRegionQuickPick({
  regionQuickPick,
  regionQuickPickItems,
  initialActiveItem,
  activeTextEditor,
  subscriptions,
}: {
  regionQuickPick: vscode.QuickPick<RegionQuickPickItem>;
  regionQuickPickItems: RegionQuickPickItem[];
  initialActiveItem: RegionQuickPickItem | undefined;
  activeTextEditor: vscode.TextEditor;
  subscriptions: vscode.Disposable[];
}): void {
  regionQuickPick.items = regionQuickPickItems;
  regionQuickPick.title = "Go to Region";
  regionQuickPick.placeholder = getRegionQuickPickPlaceholder(regionQuickPickItems);
  regionQuickPick.matchOnDescription = true;
  regionQuickPick.canSelectMany = false;
  regionQuickPick.activeItems = initialActiveItem ? [initialActiveItem] : [];
  regionQuickPick.onDidHide(
    () => onDidHideQuickPick(regionQuickPick, activeTextEditor),
    undefined,
    subscriptions
  );
  regionQuickPick.onDidChangeActive(
    (items) => onDidChangeActiveQuickPickItems(items, activeTextEditor),
    undefined,
    subscriptions
  );
  regionQuickPick.onDidAccept(
    () => onDidAcceptQuickPickItem(regionQuickPick, activeTextEditor),
    undefined,
    subscriptions
  );
}

function getRegionQuickPickPlaceholder(regionQuickPickItems: RegionQuickPickItem[]): string {
  return regionQuickPickItems.length > 0
    ? "Search for a region to jump to"
    : "No regions available";
}

function onDidHideQuickPick(
  regionQuickPick: vscode.QuickPick<RegionQuickPickItem>,
  activeTextEditor: vscode.TextEditor
): void {
  regionQuickPick.dispose();
  clearHighlightedRegions(activeTextEditor);
  scrollCurrentLineIntoView(activeTextEditor);
}

function onDidChangeActiveQuickPickItems(
  items: readonly RegionQuickPickItem[],
  activeTextEditor: vscode.TextEditor
): void {
  const activeItem = items[0];
  if (!activeItem) {
    return;
  }
  highlightAndScrollItemIntoView(activeItem, activeTextEditor);
}

function onDidAcceptQuickPickItem(
  regionQuickPick: vscode.QuickPick<RegionQuickPickItem>,
  activeTextEditor: vscode.TextEditor
): void {
  const acceptedItem = regionQuickPick.selectedItems[0];
  regionQuickPick.dispose();
  clearHighlightedRegions(activeTextEditor);
  if (!acceptedItem) {
    scrollCurrentLineIntoView(activeTextEditor);
    return;
  }
  moveCursorToFirstNonWhitespaceCharOfLine(activeTextEditor, acceptedItem.startLineIdx);
}

function highlightAndScrollItemIntoView(
  regionQuickPickItem: RegionQuickPickItem,
  activeTextEditor: vscode.TextEditor
): void {
  const { startLineIdx, endLineIdx } = regionQuickPickItem;
  highlightAndScrollRegionIntoView({ activeTextEditor, startLineIdx, endLineIdx });
}
