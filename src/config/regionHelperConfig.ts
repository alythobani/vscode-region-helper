import * as vscode from "vscode";
import { type FullOutlineViewConfig } from "./fullOutlineViewConfig";
import { type RegionsViewConfig } from "./regionsViewConfig";

type RegionHelperConfig = {
  regionsView: RegionsViewConfig;
  fullOutlineView: FullOutlineViewConfig;
};

type ConfigKeyLevel1 = keyof RegionHelperConfig;

export type GetLevel2Keys<
  K1 extends ConfigKeyLevel1,
  K2 extends keyof RegionHelperConfig[K1] = K1 extends K1 ? keyof RegionHelperConfig[K1] : never
> = K2 extends string ? `${K1}.${K2}` : never;

type ConfigKeyLevel2<K1 extends keyof RegionHelperConfig = keyof RegionHelperConfig> =
  K1 extends string ? GetLevel2Keys<K1> : never;

type RegionHelperConfigKey = ConfigKeyLevel1 | ConfigKeyLevel2;
type RegionHelperConfigValue<K extends RegionHelperConfigKey> = K extends ConfigKeyLevel1
  ? RegionHelperConfig[K]
  : K extends GetLevel2Keys<infer K1, infer K2>
  ? RegionHelperConfig[K1][K2]
  : never;

export function setGlobalRegionHelperConfigValue<K extends RegionHelperConfigKey>(
  key: K,
  value: RegionHelperConfigValue<K>
): Thenable<void> {
  return setRegionHelperConfigValue(key, value, vscode.ConfigurationTarget.Global);
}

export function setRegionHelperConfigValue<K extends RegionHelperConfigKey>(
  key: K,
  value: RegionHelperConfigValue<K>,
  configurationTarget: vscode.ConfigurationTarget
): Thenable<void> {
  const config = getRegionHelperConfig();
  return config.update(key, value, configurationTarget);
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function inspectRegionHelperConfigValue<K extends RegionHelperConfigKey>(key: K) {
  const config = getRegionHelperConfig();
  return config.inspect<RegionHelperConfigValue<K>>(key);
}

export function getRegionHelperConfig(): vscode.WorkspaceConfiguration {
  return vscode.workspace.getConfiguration("regionHelper");
}
