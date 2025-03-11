import * as vscode from "vscode";
import { type InvalidMarker } from "../lib/parseAllRegions";
import { type RegionStore } from "../state/RegionStore";
import { debounce } from "../utils/debounce";
import { throwNever } from "../utils/errorUtils";

const DEBOUNCE_DELAY_MS = 300;

export class RegionDiagnosticsManager {
  private _diagnostics = vscode.languages.createDiagnosticCollection("region-helper");

  constructor(private regionStore: RegionStore, subscriptions: vscode.Disposable[]) {
    this.registerInvalidMarkersChangeListener(subscriptions);
  }

  private registerInvalidMarkersChangeListener(subscriptions: vscode.Disposable[]): void {
    this.regionStore.onDidChangeInvalidMarkers(
      debounce(this.updateDiagnostics.bind(this), DEBOUNCE_DELAY_MS),
      undefined,
      subscriptions
    );
  }

  private updateDiagnostics(): void {
    const { activeTextEditor } = vscode.window;
    if (!activeTextEditor) {
      this.clearDiagnostics();
      return;
    }

    const { invalidMarkers } = this.regionStore;
    const diagnostics: vscode.Diagnostic[] = invalidMarkers.map((invalidMarker) =>
      createDiagnostic(invalidMarker, activeTextEditor)
    );

    this._diagnostics.set(activeTextEditor.document.uri, diagnostics);
  }

  private clearDiagnostics(): void {
    this._diagnostics.clear();
  }

  get diagnostics(): vscode.DiagnosticCollection {
    return this._diagnostics;
  }
}

function createDiagnostic(
  invalidMarker: InvalidMarker,
  activeTextEditor: vscode.TextEditor
): vscode.Diagnostic {
  const { lineIdx } = invalidMarker;
  const line = activeTextEditor.document.lineAt(lineIdx);
  const range = new vscode.Range(lineIdx, 0, lineIdx, line.text.length);
  const errorMsg = getErrorMessage(invalidMarker);
  const diagnostic = new vscode.Diagnostic(range, errorMsg, vscode.DiagnosticSeverity.Warning);
  diagnostic.source = "region-helper";
  return diagnostic;
}

function getErrorMessage(invalidMarker: InvalidMarker): string {
  switch (invalidMarker.boundaryType) {
    case "start":
      return "Unexpected region start: No matching end boundary found below.";
    case "end":
      return "Unexpected region end: No matching start boundary found above.";
    default:
      throwNever(invalidMarker.boundaryType);
  }
}
