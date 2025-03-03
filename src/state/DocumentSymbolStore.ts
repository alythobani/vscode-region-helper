import * as vscode from "vscode";
import { fetchDocumentSymbolsAfterDelay } from "../lib/fetchDocumentSymbols";
import { debounce } from "../utils/debounce";

const MAX_NUM_DOCUMENT_SYMBOLS_FETCH_ATTEMPTS = 5;
const DOCUMENT_SYMBOLS_FETCH_DELAY_MS = 300;

const DEBOUNCE_DELAY_MS = 300;

export class DocumentSymbolStore {
  private static _instance: DocumentSymbolStore | undefined = undefined;

  private _documentSymbols: vscode.DocumentSymbol[] | undefined = undefined;

  private _onDidChangeDocumentSymbols = new vscode.EventEmitter<void>();
  readonly onDidChangeDocumentSymbols = this._onDidChangeDocumentSymbols.event;

  private constructor(subscriptions: vscode.Disposable[]) {
    this.registerListeners(subscriptions);
    if (vscode.window.activeTextEditor?.document) {
      void this.refreshDocumentSymbols(vscode.window.activeTextEditor.document);
    }
  }

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

  private registerListeners(subscriptions: vscode.Disposable[]): void {
    this.registerActiveTextEditorChangeListener(subscriptions);
    this.registerDocumentChangeListener(subscriptions);
  }

  private registerActiveTextEditorChangeListener(subscriptions: vscode.Disposable[]): void {
    vscode.window.onDidChangeActiveTextEditor(
      debounce(this.onActiveTextEditorChange.bind(this), DEBOUNCE_DELAY_MS),
      undefined,
      subscriptions
    );
  }

  private onActiveTextEditorChange(editor: vscode.TextEditor | undefined): void {
    void this.refreshDocumentSymbols(editor?.document);
  }

  private registerDocumentChangeListener(subscriptions: vscode.Disposable[]): void {
    vscode.workspace.onDidChangeTextDocument(
      debounce(this.onDocumentChange.bind(this), DEBOUNCE_DELAY_MS),
      undefined,
      subscriptions
    );
  }

  private onDocumentChange(event: vscode.TextDocumentChangeEvent): void {
    void this.refreshDocumentSymbols(event.document);
  }

  private async refreshDocumentSymbols(
    document: vscode.TextDocument | undefined,
    attemptIdx = 0
  ): Promise<void> {
    console.log(`DocumentSymbolStore: refreshDocumentSymbols attemptIdx: ${attemptIdx}`);
    if (!document) {
      console.log("No document to fetch symbols for. Setting document symbols to undefined.");
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
      console.log("DocumentSymbolStore: Fetching symbols after a delay...");
      const startTime = performance.now();
      const fetchedDocumentSymbols = await fetchDocumentSymbolsAfterDelay(
        document,
        DOCUMENT_SYMBOLS_FETCH_DELAY_MS
      );
      if (fetchedDocumentSymbols === undefined) {
        const endTime = performance.now();
        console.log(`Didn't fetch document symbols after ${endTime - startTime} ms. Trying again.`);
        void this.refreshDocumentSymbols(document, attemptIdx + 1);
        return;
      }
      const endTime = performance.now();
      console.log(
        `DocumentSymbolStore: Fetched document symbols after ${
          endTime - startTime
        } ms! ${fetchedDocumentSymbols.map((symbol) => symbol.name).join(", ")}`
      );
      console.log("DocumentSymbolStore: Now going to recursively sort all children by position.");
      const sortStartTimestamp = performance.now();
      sortSymbolsRecursively(fetchedDocumentSymbols);
      const sortEndTimestamp = performance.now();
      const sortingMs = sortEndTimestamp - sortStartTimestamp;
      console.log(`DocumentSymbolStore: Sorting all children took ${sortingMs} ms.`);
      const oldDocumentSymbols = this._documentSymbols;
      this._documentSymbols = fetchedDocumentSymbols;
      if (didDocumentSymbolsChange(oldDocumentSymbols, fetchedDocumentSymbols)) {
        this._onDidChangeDocumentSymbols.fire();
      }
    } catch (_error) {
      // console.error("Error fetching document symbols:", error);
    }
  }

  get documentSymbols(): vscode.DocumentSymbol[] | undefined {
    return this._documentSymbols;
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

function didDocumentSymbolsChange(
  oldDocumentSymbols: vscode.DocumentSymbol[] | undefined,
  newDocumentSymbols: vscode.DocumentSymbol[] | undefined
): boolean {
  if (!oldDocumentSymbols || !newDocumentSymbols) {
    return oldDocumentSymbols !== newDocumentSymbols;
  }
  if (oldDocumentSymbols.length !== newDocumentSymbols.length) {
    return true;
  }
  for (let i = 0; i < oldDocumentSymbols.length; i++) {
    const oldDocumentSymbol = oldDocumentSymbols[i];
    const newDocumentSymbol = newDocumentSymbols[i];
    if (
      oldDocumentSymbol &&
      newDocumentSymbol &&
      !areDocumentSymbolsEqual(oldDocumentSymbol, newDocumentSymbol)
    ) {
      return true;
    }
  }
  return false;
}

function areDocumentSymbolsEqual(
  symbol1: vscode.DocumentSymbol,
  symbol2: vscode.DocumentSymbol
): boolean {
  return (
    symbol1.name === symbol2.name &&
    symbol1.kind === symbol2.kind &&
    symbol1.range.isEqual(symbol2.range) &&
    symbol1.selectionRange.isEqual(symbol2.selectionRange)
  );
}
