import * as path from "path";
import * as vscode from "vscode";

export async function createTestSampleDocument(
  sampleFileName: string
): Promise<vscode.TextDocument> {
  const filePath = path.join(__dirname, "samples", sampleFileName);
  return await vscode.workspace.openTextDocument(vscode.Uri.file(filePath));
}

export async function createTestInvalidSampleDocument(
  sampleFileName: string
): Promise<vscode.TextDocument> {
  const filePath = path.join(__dirname, "invalidSamples", sampleFileName);
  return await vscode.workspace.openTextDocument(vscode.Uri.file(filePath));
}
