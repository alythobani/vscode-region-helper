import * as vscode from "vscode";
import { fetchDocumentSymbols, fetchDocumentSymbolsAfterDelay } from "../lib/fetchDocumentSymbols";
import { flattenDocumentSymbols } from "../lib/flattenDocumentSymbols";
import { type DebouncedFunction, debounce } from "../utils/debounce";

const REFRESH_SYMBOLS_DEBOUNCE_DELAY_MS = 100;

/**
 * Maximum number of retry attempts for fetching document symbols.
 * Using 10 attempts with stepped delays allows for a total max wait of ~30 seconds.
 */
const MAX_NUM_DOCUMENT_SYMBOLS_FETCH_ATTEMPTS = 10;

/**
 * Stepped backoff delays for document symbol fetch retries.
 * User preference: stepped (linear) rather than exponential.
 * Reasoning: Exponential grows too quickly and is less predictable for debugging.
 *
 * Pattern:
 * - First 3 retries: 300ms (quick retries for fast language servers)
 * - Next 3 retries: 1000ms (medium pace for moderate startup)
 * - Next 2 retries: 3000ms (slower pace for heavy projects)
 * - Final 2 retries: 5000ms (patience for very slow language servers)
 *
 * Total max wait: ~30 seconds (if all retries are used)
 * - 3 × 300ms = 900ms
 * - 3 × 1000ms = 3000ms
 * - 2 × 3000ms = 6000ms
 * - 2 × 5000ms = 10000ms
 * Total: ~20 seconds for delays + parsing time ≈ 30 seconds
 */
function getRetryDelayMs(attemptIdx: number): number {
  // attemptIdx is 0-based, but on first attempt (0) we don't wait
  // So attemptIdx 1 is the first retry
  if (attemptIdx <= 3) {
    // First 3 retries: quick (300ms)
    return 300;
  } else if (attemptIdx <= 6) {
    // Next 3 retries: medium (1000ms)
    return 1000;
  } else if (attemptIdx <= 8) {
    // Next 2 retries: slower (3000ms)
    return 3000;
  } else {
    // Final retries: patience (5000ms)
    return 5000;
  }
}

export class DocumentSymbolStore implements vscode.Disposable {
  private static _instance: DocumentSymbolStore | undefined = undefined;

  static initialize(subscriptions: vscode.Disposable[]): DocumentSymbolStore {
    if (this._instance) {
      throw new Error("DocumentSymbolStore is already initialized! Only one instance is allowed.");
    }
    this._instance = new DocumentSymbolStore(subscriptions);
    subscriptions.push(this._instance);
    return this._instance;
  }

  static getInstance(): DocumentSymbolStore {
    if (!this._instance) {
      throw new Error("DocumentSymbolStore is not initialized! Call `initialize()` first.");
    }
    return this._instance;
  }

  /** For testing only: resets the singleton instance. */
  static _resetInstance(): void {
    this._instance = undefined;
  }

  private _documentSymbols: vscode.DocumentSymbol[] = [];
  private _flattenedDocumentSymbols: vscode.DocumentSymbol[] = [];
  private _onDidChangeDocumentSymbols = new vscode.EventEmitter<void>();
  readonly onDidChangeDocumentSymbols = this._onDidChangeDocumentSymbols.event;
  get documentSymbols(): vscode.DocumentSymbol[] {
    return this._documentSymbols;
  }
  get flattenedDocumentSymbols(): vscode.DocumentSymbol[] {
    return this._flattenedDocumentSymbols;
  }

  private _versionedDocumentId: string | undefined = undefined;
  get versionedDocumentId(): string | undefined {
    return this._versionedDocumentId;
  }

  private debouncedRefreshDocumentSymbols: DebouncedFunction<
    (document: vscode.TextDocument | undefined) => void
  > = debounce(this.refreshDocumentSymbols.bind(this), REFRESH_SYMBOLS_DEBOUNCE_DELAY_MS);

  private constructor(subscriptions: vscode.Disposable[]) {
    this.registerListeners(subscriptions);
    if (vscode.window.activeTextEditor?.document) {
      this.debouncedRefreshDocumentSymbols(vscode.window.activeTextEditor.document);
    }
  }

  dispose(): void {
    this.debouncedRefreshDocumentSymbols.cancel();
    this._onDidChangeDocumentSymbols.dispose();
  }

  private registerListeners(subscriptions: vscode.Disposable[]): void {
    vscode.window.onDidChangeActiveTextEditor(
      (editor) => this.debouncedRefreshDocumentSymbols(editor?.document),
      undefined,
      subscriptions
    );
    vscode.workspace.onDidChangeTextDocument(
      (event) => this.debouncedRefreshDocumentSymbols(event.document),
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
      this._documentSymbols = [];
      this._flattenedDocumentSymbols = [];
      if (oldDocumentSymbols.length > 0) {
        this._onDidChangeDocumentSymbols.fire();
      }
      return;
    }
    if (attemptIdx >= MAX_NUM_DOCUMENT_SYMBOLS_FETCH_ATTEMPTS) {
      return;
    }
    try {
      const retryDelayMs = getRetryDelayMs(attemptIdx);
      const fetchResult =
        attemptIdx === 0
          ? await fetchDocumentSymbols(document)
          : await fetchDocumentSymbolsAfterDelay(document, retryDelayMs);
      // If the document became inactive during a delayed retry, fetchResult will be undefined
      if (!fetchResult) {
        return;
      }
      const { documentSymbols, versionedDocumentId } = fetchResult;
      if (documentSymbols === undefined) {
        // Language server not ready yet - schedule next retry with stepped backoff
        void this.refreshDocumentSymbols(document, attemptIdx + 1);
        return;
      }
      sortSymbolsRecursivelyByStart(documentSymbols); // By default, `executeDocumentSymbolProvider` returns symbols ordered by name

      const oldDocumentSymbols = this._documentSymbols;
      this._versionedDocumentId = versionedDocumentId;
      this._documentSymbols = documentSymbols;
      this._flattenedDocumentSymbols = flattenDocumentSymbols(documentSymbols);

      // Only fire event if the symbols actually changed
      if (didDocumentSymbolsChange(oldDocumentSymbols, documentSymbols)) {
        this._onDidChangeDocumentSymbols.fire();
      }
    } catch {
      // Language server may not be ready or may have failed
    }
  }
}

function sortSymbolsRecursivelyByStart(symbols: vscode.DocumentSymbol[]): void {
  symbols.sort((symbol1, symbol2) => symbol1.range.start.compareTo(symbol2.range.start));
  for (const symbol of symbols) {
    sortSymbolsRecursivelyByStart(symbol.children);
  }
}

// #region Change detection helpers

function didDocumentSymbolsChange(
  oldDocumentSymbols: vscode.DocumentSymbol[],
  newDocumentSymbols: vscode.DocumentSymbol[]
): boolean {
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
    symbol1.selectionRange.isEqual(symbol2.selectionRange) &&
    !didDocumentSymbolsChange(symbol1.children, symbol2.children)
  );
}

// #endregion
