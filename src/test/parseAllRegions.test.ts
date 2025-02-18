import * as assert from "assert";
import * as vscode from "vscode";
import { parseAllRegions } from "../lib/parseAllRegions";

suite("Parse all regions", () => {
  test("Parse TypeScript regions", async () => {
    const document = await createTestDocument(
      `
// #region TestRegion
const x = 42;
// #endregion
      `,
      "typescript"
    );

    const result = parseAllRegions(document);
    assert.strictEqual(result.topLevelRegions.length, 1);
    assert.strictEqual(result.topLevelRegions[0]?.name, "TestRegion");
  });

  test("Parse Python regions", async () => {
    const document = await createTestDocument(
      `
# region OuterRegion
def foo():
    # region InnerRegion
    pass
    # endregion
# endregion
      `,
      "python"
    );

    const result = parseAllRegions(document);
    assert.strictEqual(result.topLevelRegions.length, 1);
    assert.strictEqual(result.topLevelRegions[0]?.children.length, 1);
  });
});

/** 🛠️ Create a mock VS Code document */
async function createTestDocument(
  content: string,
  languageId: string
): Promise<vscode.TextDocument> {
  return vscode.workspace.openTextDocument({ language: languageId, content });
}
