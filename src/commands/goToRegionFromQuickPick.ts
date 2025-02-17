import * as vscode from "vscode";
import { moveCursorToFirstNonWhitespaceCharOfLine } from "../lib/moveCursorToFirstNonWhitespaceOfLine";
import { scrollCurrentLineIntoView, scrollLineIntoView } from "../lib/scrollUtils";
import { type Region } from "../models/Region";
import { type RegionStore } from "../state/RegionStore";

type RegionQuickPickItem = vscode.QuickPickItem & { startLineIdx: number };

export const goToRegionFromQuickPickCommandId = "region-helper.goToRegionFromQuickPick";

export function goToRegionFromQuickPick(regionStore: RegionStore): void {
  const { activeTextEditor } = vscode.window;
  if (!activeTextEditor) {
    return;
  }

  const regionQuickPickItems = getRegionQuickPickItems(regionStore.topLevelRegions);

  vscode.window
    .showQuickPick(regionQuickPickItems, {
      title: "Go to Region",
      placeHolder:
        regionQuickPickItems.length > 0 ? "Search for a region to jump to" : "No regions available",
      matchOnDescription: true,
      onDidSelectItem(item: RegionQuickPickItem) {
        const { startLineIdx } = item;
        scrollLineIntoView(activeTextEditor, startLineIdx);
      },
    })
    .then((selectedItem) => {
      if (selectedItem === undefined) {
        scrollCurrentLineIntoView(activeTextEditor);
        return;
      }
      moveCursorToFirstNonWhitespaceCharOfLine(activeTextEditor, selectedItem.startLineIdx);
    });
}

function getRegionQuickPickItems(regions: Region[]): RegionQuickPickItem[] {
  return regions.flatMap((region) => {
    const label = region.name ?? "(Unnamed Region)";
    const { startLineIdx } = region;
    const description = `Line ${startLineIdx + 1}`;
    const regionQuickPickItem = { label, description, startLineIdx };
    return [regionQuickPickItem, ...getRegionQuickPickItems(region.children)];
  });
}
