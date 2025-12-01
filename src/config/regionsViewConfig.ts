import {
  type GetLevel2Keys,
  getRegionHelperConfig,
  setGlobalRegionHelperConfigValue,
} from "./regionHelperConfig";

export type RegionsViewConfig = Readonly<{
  isVisible: boolean;
  shouldAutoHide: boolean;
  shouldAutoHighlightActiveRegion: boolean;
}>;

type RawRegionsViewConfigKey = keyof RegionsViewConfig;

const defaultRegionsViewConfig = {
  isVisible: true,
  shouldAutoHide: true,
  shouldAutoHighlightActiveRegion: true,
} as const satisfies RegionsViewConfig;

export function setRegionsViewVisibility(isVisible: boolean): void {
  setGlobalRegionsViewConfigValue("isVisible", isVisible);
}

export function setGlobalRegionsViewConfigValue<K extends RawRegionsViewConfigKey>(
  key: K,
  value: RegionsViewConfig[K]
): Thenable<void> {
  const fullConfigKey = getRegionsViewConfigKey(key);
  return setGlobalRegionHelperConfigValue(fullConfigKey, value);
}

export function getGlobalRegionsViewConfigValue<K extends RawRegionsViewConfigKey>(
  key: K
): RegionsViewConfig[K] {
  const regionsViewConfig = getRegionsViewConfig();
  return regionsViewConfig[key];
}

function getRegionsViewConfigKey(key: RawRegionsViewConfigKey): GetLevel2Keys<"regionsView"> {
  return `regionsView.${key}`;
}

export function getRegionsViewConfig(): RegionsViewConfig {
  const regionHelperConfig = getRegionHelperConfig();
  const regionsViewConfig = regionHelperConfig.get<RegionsViewConfig>("regionsView");
  return regionsViewConfig ?? defaultRegionsViewConfig;
}
