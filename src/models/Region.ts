export type Region = {
  name?: string | undefined;
  startLineIdx: number;
  endLineIdx: number;
  parent?: Region | undefined;
  children: Region[];
};
