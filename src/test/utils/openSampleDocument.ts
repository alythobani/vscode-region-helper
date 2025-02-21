import { readdirSync } from "fs";
import * as path from "path";
import * as vscode from "vscode";

export async function openValidSampleDocument(fileName: string): Promise<vscode.TextDocument> {
  return openSampleDocument("validSamples", fileName);
}

export async function openInvalidSampleDocument(fileName: string): Promise<vscode.TextDocument> {
  return openSampleDocument("invalidSamples", fileName);
}

export async function openSampleDocument(
  ...filePathWithinSamplesDir: string[]
): Promise<vscode.TextDocument> {
  const sampleFilePath = getFullSamplesPath(...filePathWithinSamplesDir);
  return await openDocumentAtPath(sampleFilePath);
}

export async function openAllFilesInSampleFolder(
  ...folderPathWithinSamplesDir: string[]
): Promise<vscode.TextDocument[]> {
  const sampleFolderPath = getFullSamplesPath(...folderPathWithinSamplesDir);
  return await openAllFilesInDir(sampleFolderPath);
}

function getFullSamplesPath(...pathWithinSamplesDir: string[]): string {
  const workingDir = process.cwd();
  return path.join(workingDir, "src", "test", "samples", ...pathWithinSamplesDir);
}

export async function openAllFilesInDir(dirPath: string): Promise<vscode.TextDocument[]> {
  const filesNames = readdirSync(dirPath);
  const filePaths = filesNames.map((fileName) => path.join(dirPath, fileName));
  return Promise.all(filePaths.map(openDocumentAtPath));
}

export function getAllFileNamesInSampleFolder(...folderPathWithinSamplesDir: string[]): string[] {
  const sampleFolderPath = getFullSamplesPath(...folderPathWithinSamplesDir);
  return readdirSync(sampleFolderPath);
}

export async function openDocumentAtPath(filePath: string): Promise<vscode.TextDocument> {
  return await vscode.workspace.openTextDocument(vscode.Uri.file(filePath));
}
