export type Region = {
  name?: string | undefined;
  startLineIdx: number;
  endLineIdx: number;
  regionIdx: number;
  wasClosed: boolean;
  parent?: Region | undefined;
  children: Region[];
};
