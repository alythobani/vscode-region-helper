import { type FullTreeItem } from "./FullTreeItem";

export function flattenFullTreeItems(items: FullTreeItem[]): FullTreeItem[] {
  return items.flatMap((item) => [item, ...flattenFullTreeItems(item.children)]);
}
