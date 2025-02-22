export type Region = {
  name?: string | undefined;
  startLineIdx: number;
  endLineIdx: number;
  /** The index of the region within its tier. E.g. 0 for the first top-level region or the first
   * child of a region. */
  regionIdx: number;
  wasClosed: boolean;
  parent?: Region | undefined;
  children: Region[];
};
