import * as vscode from "vscode";
import { goToFullTreeItemCommandId } from "./goToFullTreeItem";

export class FullTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly range: vscode.Range,
    public readonly type: "region" | "symbol",
    public readonly parent: FullTreeItem | null,
    public readonly children: FullTreeItem[],
    public readonly icon?: vscode.ThemeIcon
  ) {
    super(
      label,
      children.length > 0
        ? vscode.TreeItemCollapsibleState.Expanded
        : vscode.TreeItemCollapsibleState.None
    );
    this.command = {
      command: goToFullTreeItemCommandId,
      title: "Go to Item",
      arguments: [range.start.line, type === "region" ? undefined : range.start.character],
    };
    if (icon) this.iconPath = icon;
  }
}
