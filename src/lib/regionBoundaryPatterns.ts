type RegionBoundaryPattern = {
  /** The regular expression that matches the start of a region. Should capture the name of the region. */
  startRegex: RegExp;
  /** The regular expression that matches the end of a region. */
  endRegex: RegExp;
};

const tsAndJsBlockCommentPattern: RegionBoundaryPattern = {
  startRegex: /^\s*\/\*\*?\s*#region(?:\s+(.+?))?\s*\*\//,
  endRegex: /^\s*\/\*\*?\s*#endregion\s*\*\//,
};

const tsAndJsLineCommentPattern: RegionBoundaryPattern = {
  startRegex: /^\s*\/\/\s*#region(?:\s+(.+?))?$/,
  endRegex: /^\s*\/\/\s*#endregion\s*$/,
};

export const regionBoundaryPatternsByLanguageId: Record<string, RegionBoundaryPattern[]> = {
  typescript: [tsAndJsBlockCommentPattern, tsAndJsLineCommentPattern],
  javascript: [tsAndJsBlockCommentPattern, tsAndJsLineCommentPattern],
};
