import * as vscode from "vscode";
import { type RegionHelperNonClosuredCommand } from "../../commands/registerCommand";
import { throwNever } from "../../utils/errorUtils";
import { focusActiveEditorGroup } from "../../utils/focusEditor";
import { moveCursorToFirstNonWhitespaceCharOfLine } from "../../utils/moveCursorToFirstNonWhitespaceOfLine";
import { moveCursorToPosition } from "../../utils/moveCursorToPosition";
import { type FullTreeItemType } from "./FullTreeItem";

export const goToFullTreeItemCommand: RegionHelperNonClosuredCommand = {
  id: "regionHelper.goToFullTreeItem",
  callback: goToFullTreeItem,
  needsRegionHelperParams: false,
};

function goToFullTreeItem(startLineIdx: number, startCharacter: number | undefined): void {
  const { activeTextEditor } = vscode.window;
  if (!activeTextEditor) {
    return;
  }
  if (startCharacter === undefined) {
    moveCursorToFirstNonWhitespaceCharOfLine({
      activeTextEditor,
      lineIdx: startLineIdx,
      revealType: vscode.TextEditorRevealType.InCenterIfOutsideViewport,
    });
  } else {
    moveCursorToPosition({
      activeTextEditor,
      lineIdx: startLineIdx,
      character: startCharacter,
      revealType: vscode.TextEditorRevealType.InCenterIfOutsideViewport,
    });
  }
  void focusActiveEditorGroup();
}

export function makeGoToFullTreeItemCommand(
  itemType: FullTreeItemType,
  range: vscode.Range
): vscode.Command {
  return {
    command: goToFullTreeItemCommand.id,
    title: "Go to Item",
    arguments: [range.start.line, getTargetCharacter(itemType, range)],
  };
}

function getTargetCharacter(itemType: FullTreeItemType, range: vscode.Range): number | undefined {
  switch (itemType) {
    case "region":
      // Just go to the first non-whitespace character of the line
      return undefined;
    case "symbol":
      return range.start.character;
    default:
      throwNever(itemType);
  }
}
