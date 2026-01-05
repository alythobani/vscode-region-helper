import * as vscode from "vscode";
import { getRegionHelperConfig, inspectRegionHelperConfigValue } from "../regionHelperConfig";

import type { RegionsViewShowMode } from "../regionsViewConfig";

/**
 * Migrates the `regionsView.isVisible` setting to the `regionsView.show` setting (1.5.3 → 1.6.0).
 *
 * The `regionsView.isVisible` setting was a boolean. The `regionsView.show` setting is now an enum
 * with the values `"always"`, `"whenRegionsExist"`, and `"never"`.
 *
 * Maps `true` to `"whenRegionsExist"` (since this is just an upgraded version of `isVisible: true`)
 * and `false` to `"never"` for each possible scope (Global, Workspace, Workspace Folder).
 */
export async function migrateRegionsViewIsVisibleToShowConfig(): Promise<void> {
  const config = getRegionHelperConfig();
  const isVisibleInspect = config.inspect<boolean>("regionsView.isVisible");
  if (!isVisibleInspect) {
    return;
  }
  const showInspect = inspectRegionHelperConfigValue("regionsView.show");
  await migrateScope({
    config,
    configurationTarget: vscode.ConfigurationTarget.Global,
    isVisible: isVisibleInspect.globalValue,
    currentShow: showInspect?.globalValue,
  });
  await migrateScope({
    config,
    configurationTarget: vscode.ConfigurationTarget.Workspace,
    isVisible: isVisibleInspect.workspaceValue,
    currentShow: showInspect?.workspaceValue,
  });
  await migrateScope({
    config,
    configurationTarget: vscode.ConfigurationTarget.WorkspaceFolder,
    isVisible: isVisibleInspect.workspaceFolderValue,
    currentShow: showInspect?.workspaceFolderValue,
  });
}

async function migrateScope({
  config,
  configurationTarget,
  isVisible,
  currentShow,
}: {
  config: vscode.WorkspaceConfiguration;
  configurationTarget: vscode.ConfigurationTarget;
  isVisible: boolean | undefined;
  currentShow: RegionsViewShowMode | undefined;
}): Promise<void> {
  if (isVisible === undefined || currentShow !== undefined) {
    return;
  }
  const nextShow: RegionsViewShowMode = isVisible ? "whenRegionsExist" : "never";
  await config.update("regionsView.show", nextShow, configurationTarget);
  await config.update("regionsView.isVisible", undefined, configurationTarget);
}
