import * as vscode from "vscode";

type RegionHelperConfiguration = {
  shouldShowRegionsView: boolean;
  shouldShowFullOutlineView: boolean;
};

type RegionHelperConfigurationKey = keyof RegionHelperConfiguration;

export function setShouldShowRegionsView(shouldShow: boolean): void {
  setGlobalRegionHelperConfigValue("shouldShowRegionsView", shouldShow);
}

export function setShouldShowFullOutlineView(shouldShow: boolean): void {
  setGlobalRegionHelperConfigValue("shouldShowFullOutlineView", shouldShow);
}

export function setGlobalRegionHelperConfigValue(
  key: RegionHelperConfigurationKey,
  value: unknown
): Thenable<void> {
  const config = getRegionHelperConfiguration();
  return config.update(key, value, vscode.ConfigurationTarget.Global);
}

export function getGlobalRegionHelperConfigValue(key: RegionHelperConfigurationKey): unknown {
  const config = getRegionHelperConfiguration();
  return config.get(key);
}

export function getRegionHelperConfiguration(): vscode.WorkspaceConfiguration {
  return vscode.workspace.getConfiguration("region-helper");
}
