import {
  type RegionHelperClosuredCommandCallback,
  type RegionHelperStoresCommand,
} from "./registerCommand";

const expandAllFullOutlineItems: RegionHelperClosuredCommandCallback = () => {
  // ?
};

const collapseAllFullOutlineItems: RegionHelperClosuredCommandCallback = () => {
  // ?
};

const expandAllFullOutlineItemsCommand: RegionHelperStoresCommand = {
  id: "regionHelper.fullOutlineView.expandAll",
  callback: expandAllFullOutlineItems,
  needsStoreParams: true,
};

const collapseAllFullOutlineItemsCommand: RegionHelperStoresCommand = {
  id: "regionHelper.fullOutlineView.collapseAll",
  callback: collapseAllFullOutlineItems,
  needsStoreParams: true,
};

export const allExpandAndCollapseAllCommands = [
  expandAllFullOutlineItemsCommand,
  collapseAllFullOutlineItemsCommand,
];
