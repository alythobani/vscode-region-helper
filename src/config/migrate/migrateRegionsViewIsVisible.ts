import * as vscode from "vscode";
import { getRegionHelperConfig, inspectRegionHelperConfigValue } from "../regionHelperConfig";

import type { RegionsViewShowMode } from "../regionsViewConfig";

/**
 * Migrates the `regionsView.isVisible` setting to the `regionsView.show` setting (1.5.3 → 1.6.0).
 *
 * The `regionsView.isVisible` setting was a boolean. The `regionsView.show` setting is now an enum
 * with the values `"always"`, `"whenRegionsExist"`, and `"never"`.
 *
 * Maps `true` to `"always"` and `false` to `"never"` for each possible scope (Global, Workspace,
 * Workspace Folder).
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
    show: showInspect?.globalValue,
  });
  await migrateScope({
    config,
    configurationTarget: vscode.ConfigurationTarget.Workspace,
    isVisible: isVisibleInspect.workspaceValue,
    show: showInspect?.workspaceValue,
  });
  await migrateScope({
    config,
    configurationTarget: vscode.ConfigurationTarget.WorkspaceFolder,
    isVisible: isVisibleInspect.workspaceFolderValue,
    show: showInspect?.workspaceFolderValue,
  });
}

async function migrateScope({
  config,
  configurationTarget,
  isVisible,
  show,
}: {
  config: vscode.WorkspaceConfiguration;
  configurationTarget: vscode.ConfigurationTarget;
  isVisible: boolean | undefined;
  show: RegionsViewShowMode | undefined;
}): Promise<void> {
  if (isVisible === undefined || show !== undefined) {
    return;
  }
  const nextShow: RegionsViewShowMode = isVisible ? "always" : "never";
  await config.update("regionsView.show", nextShow, configurationTarget);
  await config.update("regionsView.isVisible", undefined, configurationTarget);
}
