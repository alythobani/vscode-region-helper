import type * as vscode from "vscode";

export type Region = {
  /** Unique ID based on the region's name (or 'unnamed') and the number of regions seen so far with
   * that name, used for persistent collapsed/selected state. */
  id: string;
  name?: string | undefined;
  /** The range of the region, from the start of the first line to the end of the last line. */
  range: vscode.Range;
  /** The index of the region within its tier. E.g. 0 for the first top-level region or the first
   * child of a region. */
  regionIdx: number;
  wasClosed: boolean;
  parent?: Region | undefined;
  children: Region[];
};
