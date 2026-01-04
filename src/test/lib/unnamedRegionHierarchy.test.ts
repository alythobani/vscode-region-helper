import * as assert from "assert";
import { parseAllRegions } from "../../lib/parseAllRegions";
import { openValidSampleDocument } from "../utils/openSampleDocument";

/**
 * Tests for unnamed region hierarchy and tree view alignment.
 * 
 * Ensures that unnamed regions maintain correct parent-child relationships
 * and regionIdx values, so they display at the correct indentation level
 * in the tree view (aligned with named siblings).
 */
suite("Unnamed Region Hierarchy", () => {
  test("should assign correct regionIdx to unnamed regions as children", async () => {
    const document = await openValidSampleDocument("validSample.cs");
    const { topLevelRegions } = parseAllRegions(document);

    // Should have FirstRegion and Second Region at top level
    assert.strictEqual(topLevelRegions.length, 2, "Should have 2 top-level regions");
    const firstRegion = topLevelRegions[0];
    const secondRegion = topLevelRegions[1];
    
    if (!firstRegion || !secondRegion) {
      throw new Error("Regions not found");
    }

    assert.strictEqual(firstRegion.name, "FirstRegion", "First region should be named FirstRegion");
    assert.strictEqual(secondRegion.name, "Second Region", "Second region should be named Second Region");

    // Check Second Region's children
    assert.strictEqual(secondRegion.children.length, 2, "Second Region should have 2 children");
    
    const innerRegion = secondRegion.children[0];
    const unnamedRegion = secondRegion.children[1];
    
    if (!innerRegion || !unnamedRegion) {
      throw new Error("Child regions not found");
    }

    // Verify InnerRegion
    assert.strictEqual(innerRegion.name, "InnerRegion", "First child should be InnerRegion");
    assert.strictEqual(innerRegion.regionIdx, 0, "InnerRegion should have regionIdx=0");
    assert.strictEqual(innerRegion.parent, secondRegion, "InnerRegion parent should be Second Region");

    // Verify unnamed region
    assert.strictEqual(unnamedRegion.name, undefined, "Second child should be unnamed");
    assert.strictEqual(unnamedRegion.regionIdx, 1, "Unnamed region should have regionIdx=1");
    assert.strictEqual(unnamedRegion.parent, secondRegion, "Unnamed region parent should be Second Region");
  });

  test("Tree view should treat unnamed region as sibling with correct hierarchy", async () => {
    // This test verifies that the tree view provider would correctly handle unnamed regions
    // by ensuring regionIdx values enable proper tree construction and parentage
    const document = await openValidSampleDocument("validSample.cs");
    const { topLevelRegions } = parseAllRegions(document);
    const secondRegion = topLevelRegions[1];
    
    if (!secondRegion) {
      throw new Error("Second Region not found");
    }

    const innerRegion = secondRegion.children[0];
    const unnamedRegion = secondRegion.children[1];
    
    if (!innerRegion || !unnamedRegion) {
      throw new Error("Child regions not found");
    }

    // Tree view calls getParent(unnamedRegion) - should return secondRegion
    assert.strictEqual(
      unnamedRegion.parent,
      secondRegion,
      "Unnamed region should have Second Region as parent"
    );

    // Tree view calls getParent(innerRegion) - should return secondRegion
    assert.strictEqual(
      innerRegion.parent,
      secondRegion,
      "InnerRegion should have Second Region as parent"
    );

    // Both should have the same parent (so they appear at same indentation level)
    assert.strictEqual(
      innerRegion.parent,
      unnamedRegion.parent,
      "Named and unnamed siblings should share same parent"
    );

    // RegionIdx should be sequential
    assert.strictEqual(innerRegion.regionIdx, 0, "First child should have regionIdx=0");
    assert.strictEqual(unnamedRegion.regionIdx, 1, "Second child should have regionIdx=1");
  });
});
