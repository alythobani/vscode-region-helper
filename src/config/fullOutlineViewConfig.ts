import {
  type GetLevel2Keys,
  getRegionHelperConfig,
  setGlobalRegionHelperConfigValue,
} from "./regionHelperConfig";

export type FullOutlineViewConfig = Readonly<{
  isVisible: boolean;
  shouldFollowActiveItem: boolean;
}>;

type RawFullOutlineViewConfigKey = keyof FullOutlineViewConfig;

const defaultFullOutlineViewConfig = {
  isVisible: true,
  shouldFollowActiveItem: true,
} as const satisfies FullOutlineViewConfig;

export function setGlobalFullOutlineViewConfigValue<K extends RawFullOutlineViewConfigKey>(
  key: K,
  value: FullOutlineViewConfig[K]
): Thenable<void> {
  const fullConfigKey = getFullOutlineViewConfigKey(key);
  return setGlobalRegionHelperConfigValue(fullConfigKey, value);
}

export function getGlobalFullOutlineViewConfigValue<K extends RawFullOutlineViewConfigKey>(
  key: K
): FullOutlineViewConfig[K] {
  const regionHelperConfig = getFullOutlineViewConfig();
  return regionHelperConfig[key];
}

function getFullOutlineViewConfigKey(
  key: RawFullOutlineViewConfigKey
): GetLevel2Keys<"fullOutlineView"> {
  return `fullOutlineView.${key}`;
}

export function getFullOutlineViewConfig(): FullOutlineViewConfig {
  const regionHelperConfig = getRegionHelperConfig();
  const fullOutlineViewConfig = regionHelperConfig.get<FullOutlineViewConfig>("fullOutlineView");
  return fullOutlineViewConfig ?? defaultFullOutlineViewConfig;
}
