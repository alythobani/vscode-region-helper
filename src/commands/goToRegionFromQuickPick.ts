import * as vscode from "vscode";
import { moveCursorToFirstNonWhitespaceCharOfLine } from "../lib/moveCursorToFirstNonWhitespaceOfLine";
import { type Region } from "../models/Region";
import { type RegionStore } from "../state/RegionStore";

type RegionQuickPickItem = vscode.QuickPickItem & { region: Region };

export const goToRegionFromQuickPickCommandId = "region-helper.goToRegionFromQuickPick";

export function goToRegionFromQuickPick(regionStore: RegionStore): void {
  const { activeTextEditor } = vscode.window;
  if (!activeTextEditor) {
    return;
  }

  const regions = regionStore.topLevelRegions;
  // if (regions.length === 0) {
  //   vscode.window.showInformationMessage("No regions found in the current document.");
  //   return;
  // }

  const regionQuickPickItems: RegionQuickPickItem[] = getRegionQuickPickItems(regions);

  vscode.window
    .showQuickPick(regionQuickPickItems, {
      title: "Go to Region",
      placeHolder: "Search for a region to jump to",
      matchOnDescription: true,
    })
    .then((selectedItem) => {
      if (selectedItem === undefined) {
        return;
      }
      moveCursorToFirstNonWhitespaceCharOfLine(activeTextEditor, selectedItem.region.startLineIdx);
    });
}

function getRegionQuickPickItems(regions: Region[]): RegionQuickPickItem[] {
  return regions.flatMap((region) => {
    const regionName = region.name ?? "(Unnamed Region)";
    return [
      {
        label: regionName,
        description: `Line ${region.startLineIdx + 1}`,
        region,
      },
      ...getRegionQuickPickItems(region.children),
    ];
  });
}
