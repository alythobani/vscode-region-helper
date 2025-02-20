import * as vscode from "vscode";
import { type InvalidMarker } from "../lib/parseAllRegions";
import { type RegionStore } from "../state/RegionStore";

export class RegionDiagnosticsManager {
  private _diagnostics = vscode.languages.createDiagnosticCollection("region-helper");

  constructor(private regionStore: RegionStore, subscriptions: vscode.Disposable[]) {
    this.registerInvalidMarkersChangeListener(subscriptions);
  }

  private registerInvalidMarkersChangeListener(subscriptions: vscode.Disposable[]): void {
    this.regionStore.onDidChangeInvalidMarkers(
      () => this.updateDiagnostics(),
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
  const { lineIdx, errorMsg } = invalidMarker;
  const line = activeTextEditor.document.lineAt(lineIdx);
  const { length: lineLength } = line.text;
  const range = new vscode.Range(lineIdx, 0, lineIdx, lineLength);
  return new vscode.Diagnostic(range, errorMsg, vscode.DiagnosticSeverity.Warning);
}
