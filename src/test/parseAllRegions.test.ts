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

/* #region AnotherRegion */
class MyClass {
  // #region InnerRegion
  method() {}
  // #endregion
}
/* #endregion */
      `,
      "typescript"
    );

    const result = parseAllRegions(document);
    assert.strictEqual(result.topLevelRegions.length, 2);
    assert.strictEqual(result.topLevelRegions[0]?.name, "TestRegion");
    assert.strictEqual(result.topLevelRegions[1]?.name, "AnotherRegion");
    assert.strictEqual(result.topLevelRegions[1]?.children.length, 1);
    assert.strictEqual(result.topLevelRegions[1]?.children[0]?.name, "InnerRegion");
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
    assert.strictEqual(result.topLevelRegions[0]?.children[0]?.name, "InnerRegion");
  });

  test("Parse C# regions", async () => {
    const document = await createTestDocument(
      `
// #region OuterRegion
class MyClass {
    // #region InnerRegion
    void MyMethod() {}
    // #endregion
}
// #endregion
      `,
      "csharp"
    );

    const result = parseAllRegions(document);
    assert.strictEqual(result.topLevelRegions.length, 1);
    assert.strictEqual(result.topLevelRegions[0]?.children.length, 1);
    assert.strictEqual(result.topLevelRegions[0]?.children[0]?.name, "InnerRegion");
  });
});

/** 🛠️ Create a mock VS Code document */
async function createTestDocument(
  content: string,
  languageId: string
): Promise<vscode.TextDocument> {
  return vscode.workspace.openTextDocument({ language: languageId, content });
}
