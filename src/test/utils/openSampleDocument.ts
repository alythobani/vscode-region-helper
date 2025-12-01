import { existsSync, readdirSync } from "fs";
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
  // When bundled via webpack, __dirname varies by test file location.
  // Test files in dist-tests/src/test/ have __dirname = dist-tests/src/test
  // Test files in dist-tests/src/test/lib/ have __dirname = dist-tests/src/test/lib
  // Samples are always at dist-tests/samples
  // We traverse up from __dirname looking for the samples folder.

  // First, try to find samples relative to __dirname by going up until we find them
  let dir = __dirname;
  for (let i = 0; i < 5; i++) {
    const candidate = path.join(dir, "samples", ...pathWithinSamplesDir);
    if (existsSync(candidate)) {
      return candidate;
    }
    dir = path.dirname(dir);
  }

  // Fallback: try standard locations
  const candidates = [
    path.join(process.cwd(), "src", "test", "samples", ...pathWithinSamplesDir),
    path.join(process.cwd(), "dist-tests", "samples", ...pathWithinSamplesDir),
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  // Fall back to original behavior and let it fail with a clear message
  throw new Error(
    `Cannot find samples folder. Tried traversing up from __dirname=${__dirname}, ` +
    `and standard paths from cwd=${process.cwd()}`
  );
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
