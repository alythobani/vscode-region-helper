import {
  type RegionHelperClosuredCommand,
  type RegionHelperClosuredParams,
} from "./registerCommand";

// #region Exported commands

const expandAllRegionTreeItemsCommand: RegionHelperClosuredCommand = {
  id: "regionHelper.regionsView.expandAll",
  callback: expandAllRegionTreeItems,
  needsRegionHelperParams: true,
};

const expandAllFullOutlineItemsCommand: RegionHelperClosuredCommand = {
  id: "regionHelper.fullOutlineView.expandAll",
  callback: expandAllFullOutlineItems,
  needsRegionHelperParams: true,
};

export const allExpandAllCommands = [
  expandAllRegionTreeItemsCommand,
  expandAllFullOutlineItemsCommand,
];

// #endregion

// #region Command implementations

function expandAllRegionTreeItems({ regionTreeViewProvider }: RegionHelperClosuredParams): void {
  regionTreeViewProvider.expandAllTreeItems();
}

function expandAllFullOutlineItems({ fullTreeViewProvider }: RegionHelperClosuredParams): void {
  fullTreeViewProvider.expandAllTreeItems();
}

// #endregion
