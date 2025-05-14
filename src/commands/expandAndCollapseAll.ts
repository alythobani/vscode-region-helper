import {
  type RegionHelperClosuredCommand,
  type RegionHelperClosuredParams,
} from "./registerCommand";

const expandAllFullOutlineItemsCommand: RegionHelperClosuredCommand = {
  id: "regionHelper.fullOutlineView.expandAll",
  callback: expandAllFullOutlineItems,
  needsRegionHelperParams: true,
};

export const allExpandAllCommands = [expandAllFullOutlineItemsCommand];

function expandAllFullOutlineItems({ fullTreeViewProvider }: RegionHelperClosuredParams): void {
  fullTreeViewProvider.expandAllTreeItems();
}
