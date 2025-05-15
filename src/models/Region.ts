export type Region = {
  /** Unique ID based on the region's name (or 'unnamed') and the number of regions seen so far with
   * that name, used for persistent collapsed/selected state. */
  id: string;
  name?: string | undefined;
  // TODO: refactor the next 3 into just a `vscode.Range` field
  startLineIdx: number;
  endLineIdx: number;
  endLineCharacterIdx: number;
  /** The index of the region within its tier. E.g. 0 for the first top-level region or the first
   * child of a region. */
  regionIdx: number;
  wasClosed: boolean;
  parent?: Region | undefined;
  children: Region[];
};
