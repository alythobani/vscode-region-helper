import * as vscode from "vscode";
import { fetchDocumentSymbols, fetchDocumentSymbolsAfterDelay } from "../lib/fetchDocumentSymbols";
import { debounce } from "../utils/debounce";

const REFRESH_SYMBOLS_DEBOUNCE_DELAY_MS = 300;

const MAX_NUM_DOCUMENT_SYMBOLS_FETCH_ATTEMPTS = 5;
const DOCUMENT_SYMBOLS_FETCH_DELAY_MS = 300;

export class DocumentSymbolStore {
  private static _instance: DocumentSymbolStore | undefined = undefined;

  static initialize(subscriptions: vscode.Disposable[]): DocumentSymbolStore {
    if (this._instance) {
      throw new Error("DocumentSymbolStore is already initialized! Only one instance is allowed.");
    }
    this._instance = new DocumentSymbolStore(subscriptions);
    return this._instance;
  }

  static getInstance(): DocumentSymbolStore {
    if (!this._instance) {
      throw new Error("DocumentSymbolStore is not initialized! Call `initialize()` first.");
    }
    return this._instance;
  }

  private _documentSymbols: vscode.DocumentSymbol[] | undefined = undefined;
  private _onDidChangeDocumentSymbols = new vscode.EventEmitter<void>();
  readonly onDidChangeDocumentSymbols = this._onDidChangeDocumentSymbols.event;
  get documentSymbols(): vscode.DocumentSymbol[] | undefined {
    return this._documentSymbols;
  }

  private _versionedDocumentId: string | undefined = undefined;
  get versionedDocumentId(): string | undefined {
    return this._versionedDocumentId;
  }

  private debouncedRefreshDocumentSymbols = debounce(
    this.refreshDocumentSymbols.bind(this),
    REFRESH_SYMBOLS_DEBOUNCE_DELAY_MS
  );

  private constructor(subscriptions: vscode.Disposable[]) {
    this.registerListeners(subscriptions);
    if (vscode.window.activeTextEditor?.document) {
      void this.debouncedRefreshDocumentSymbols(vscode.window.activeTextEditor.document);
    }
  }

  private registerListeners(subscriptions: vscode.Disposable[]): void {
    vscode.window.onDidChangeActiveTextEditor(
      (editor) => void this.debouncedRefreshDocumentSymbols(editor?.document),
      undefined,
      subscriptions
    );
    vscode.workspace.onDidChangeTextDocument(
      (event) => void this.debouncedRefreshDocumentSymbols(event.document),
      undefined,
      subscriptions
    );
  }

  private async refreshDocumentSymbols(
    document: vscode.TextDocument | undefined,
    attemptIdx = 0
  ): Promise<void> {
    if (!document) {
      this._versionedDocumentId = undefined;
      const oldDocumentSymbols = this._documentSymbols;
      this._documentSymbols = undefined;
      if (oldDocumentSymbols) {
        this._onDidChangeDocumentSymbols.fire();
      }
      return;
    }
    if (attemptIdx >= MAX_NUM_DOCUMENT_SYMBOLS_FETCH_ATTEMPTS) {
      // console.warn(`Failed to fetch document symbols after ${attemptIdx} attempts. Giving up.`);
      return;
    }
    try {
      const { documentSymbols, versionedDocumentId } =
        attemptIdx === 0
          ? await fetchDocumentSymbols(document)
          : await fetchDocumentSymbolsAfterDelay(document, DOCUMENT_SYMBOLS_FETCH_DELAY_MS);
      if (documentSymbols === undefined) {
        void this.debouncedRefreshDocumentSymbols(document, attemptIdx + 1);
        return;
      }
      sortSymbolsRecursively(documentSymbols);
      this._versionedDocumentId = versionedDocumentId;
      this._documentSymbols = documentSymbols;
      this._onDidChangeDocumentSymbols.fire();
    } catch (_error) {
      // console.error("Error fetching document symbols:", error);
    }
  }
}

function sortSymbolsRecursively(symbols: vscode.DocumentSymbol[]): void {
  symbols.sort((symbol1, symbol2) => {
    if (symbol1.range.start.isBefore(symbol2.range.start)) {
      return -1;
    } else if (symbol1.range.start.isAfter(symbol2.range.start)) {
      return 1;
    } else {
      return 0;
    }
  });
  for (const symbol of symbols) {
    sortSymbolsRecursively(symbol.children);
  }
}

// function didDocumentSymbolsChange(
//   oldDocumentSymbols: vscode.DocumentSymbol[] | undefined,
//   newDocumentSymbols: vscode.DocumentSymbol[] | undefined
// ): boolean {
//   if (!oldDocumentSymbols || !newDocumentSymbols) {
//     return oldDocumentSymbols !== newDocumentSymbols;
//   }
//   if (oldDocumentSymbols.length !== newDocumentSymbols.length) {
//     return true;
//   }
//   for (let i = 0; i < oldDocumentSymbols.length; i++) {
//     const oldDocumentSymbol = oldDocumentSymbols[i];
//     const newDocumentSymbol = newDocumentSymbols[i];
//     if (
//       oldDocumentSymbol &&
//       newDocumentSymbol &&
//       !areDocumentSymbolsEqual(oldDocumentSymbol, newDocumentSymbol)
//     ) {
//       return true;
//     }
//   }
//   return false;
// }

// function areDocumentSymbolsEqual(
//   symbol1: vscode.DocumentSymbol,
//   symbol2: vscode.DocumentSymbol
// ): boolean {
//   return (
//     symbol1.name === symbol2.name &&
//     symbol1.kind === symbol2.kind &&
//     symbol1.range.isEqual(symbol2.range) &&
//     symbol1.selectionRange.isEqual(symbol2.selectionRange)
//   );
// }
