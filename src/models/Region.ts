export type Region = {
  name?: string | undefined;
  startLineIdx: number;
  endLineIdx: number;
  children: Region[];
};
