import type * as vscode from "vscode";

export function getVersionedDocumentId(document: vscode.TextDocument): string {
  return `${document.uri.toString()}@${document.version}`;
}
