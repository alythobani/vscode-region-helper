import * as vscode from "vscode";
import { getRegionDisplayName, getRegionRangeText } from "../lib/getRegionDisplayInfo";
import { type Region } from "../models/Region";
import { type RegionStore } from "../state/RegionStore";

export class RegionSymbolProvider implements vscode.DocumentSymbolProvider {
  constructor(private regionStore: RegionStore) {}

  provideDocumentSymbols(
    _document: vscode.TextDocument,
    _token: vscode.CancellationToken
  ): vscode.DocumentSymbol[] {
    // Get regions for the current document
    const topLevelRegions = this.regionStore.topLevelRegions;
    return topLevelRegions.map(getRegionDocumentSymbol);
  }
}

function getRegionDocumentSymbol(region: Region): vscode.DocumentSymbol {
  const range = new vscode.Range(region.startLineIdx, 0, region.endLineIdx, 0);
  const symbol = new vscode.DocumentSymbol(
    getRegionDisplayName(region),
    getRegionRangeText(region),
    vscode.SymbolKind.Namespace, // Regions are like "sections" in code
    range,
    range
  );

  // Convert children recursively
  symbol.children = region.children.map(getRegionDocumentSymbol);
  return symbol;
}
