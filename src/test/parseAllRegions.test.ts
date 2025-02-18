import * as assert from "assert";
import { promises as fs } from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { parseAllRegions } from "../lib/parseAllRegions";

const testLanguages = ["typescript", "python", "csharp"];

suite("Parse all regions", () => {
  for (const languageId of testLanguages) {
    test(`Parse regions in ${languageId}`, async () => {
      const document = await createTestDocumentForLanguage(languageId);
      const result = parseAllRegions(document);

      assert.strictEqual(result.topLevelRegions.length, 2, "Expected 2 top-level regions");
      assert.strictEqual(result.topLevelRegions[0]?.name, "FirstRegion");
      assert.strictEqual(result.topLevelRegions[1]?.name, "SecondRegion");
      assert.strictEqual(result.topLevelRegions[1]?.children.length, 1, "Expected 1 nested region");
      assert.strictEqual(result.topLevelRegions[1]?.children[0]?.name, "InnerRegion");
    });
  }
});

async function createTestDocumentForLanguage(languageId: string): Promise<vscode.TextDocument> {
  const extension = getFileExtensionForLanguage(languageId);
  const fileName = `sample.${extension}`;
  return createTestDocumentFromSampleFile(fileName, languageId);
}

async function createTestDocumentFromSampleFile(
  filename: string,
  languageId: string
): Promise<vscode.TextDocument> {
  const filePath = path.join(__dirname, "samples", filename);
  const content = await fs.readFile(filePath, "utf8");
  return vscode.workspace.openTextDocument({ language: languageId, content });
}

function getFileExtensionForLanguage(languageId: string): string {
  switch (languageId) {
    case "typescript":
      return "ts";
    case "python":
      return "py";
    case "csharp":
      return "cs";
    default:
      throw new Error(`Unsupported language: ${languageId}`);
  }
}
