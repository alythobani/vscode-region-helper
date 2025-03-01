import type * as vscode from "vscode";
import { type FullTreeItem } from "./FullTreeItem";

export function getActiveFullTreeItem(
  fullTreeItems: FullTreeItem[],
  cursorPosition: vscode.Position
): FullTreeItem | undefined {
  for (const fullTreeItem of fullTreeItems) {
    if (!fullTreeItem.range.contains(cursorPosition)) {
      continue;
    }
    return getActiveFullTreeItem(fullTreeItem.children, cursorPosition) ?? fullTreeItem;
  }
  return undefined;
}
