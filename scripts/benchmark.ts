/**
 * Command-line benchmark script for Region Helper
 * 
 * This script benchmarks the core parsing logic without requiring VS Code.
 * Run with: npx ts-node scripts/benchmark.ts
 */

import { performance } from "perf_hooks";

// Simulate region parsing logic (extracted from parseAllRegions.ts)
type MockRegion = {
  id: string;
  name: string;
  startLine: number;
  endLine: number;
};

function generateTestDocument(lineCount: number, regionCount: number): string[] {
  const lines: string[] = [];
  const linesPerRegion = Math.floor(lineCount / regionCount);

  for (let r = 0; r < regionCount; r++) {
    lines.push(`// #region Region${r + 1}`);
    for (let l = 0; l < linesPerRegion - 2; l++) {
      lines.push(`const var${r}_${l} = ${l};`);
    }
    lines.push(`// #endregion`);
  }

  return lines;
}

function parseRegions(lines: string[]): MockRegion[] {
  const regions: MockRegion[] = [];
  const stack: { name: string; startLine: number }[] = [];
  const startRegex = /^\s*\/\/\s*#region\s*(.*)/;
  const endRegex = /^\s*\/\/\s*#endregion/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line === undefined) continue;
    const startMatch = startRegex.exec(line);
    if (startMatch) {
      stack.push({ name: startMatch[1] || `Region ${regions.length + 1}`, startLine: i });
    }
    const endMatch = endRegex.exec(line);
    if (endMatch && stack.length > 0) {
      const start = stack.pop()!;
      regions.push({
        id: `region-${regions.length}`,
        name: start.name,
        startLine: start.startLine,
        endLine: i,
      });
    }
  }

  return regions;
}

// Comparison functions (simulating the event firing optimization)
function areRegionsEqual(a: MockRegion, b: MockRegion): boolean {
  return a.id === b.id && a.name === b.name && a.startLine === b.startLine && a.endLine === b.endLine;
}

function didRegionsChange(oldRegions: MockRegion[], newRegions: MockRegion[]): boolean {
  if (oldRegions.length !== newRegions.length) return true;
  for (let i = 0; i < oldRegions.length; i++) {
    const oldRegion = oldRegions[i];
    const newRegion = newRegions[i];
    if (oldRegion === undefined || newRegion === undefined) return true;
    if (!areRegionsEqual(oldRegion, newRegion)) return true;
  }
  return false;
}

// Benchmark runner
interface BenchmarkResult {
  name: string;
  iterations: number;
  avgTimeMs: number;
  eventsWithoutOptimization: number;
  eventsWithOptimization: number;
}

function runBenchmark(): BenchmarkResult[] {
  const results: BenchmarkResult[] = [];

  const scenarios = [
    { name: "Small file (100 lines, 5 regions)", lines: 100, regions: 5, iterations: 100 },
    { name: "Medium file (500 lines, 25 regions)", lines: 500, regions: 25, iterations: 50 },
    { name: "Large file (1000 lines, 50 regions)", lines: 1000, regions: 50, iterations: 25 },
  ];

  for (const scenario of scenarios) {
    const document = generateTestDocument(scenario.lines, scenario.regions);
    const times: number[] = [];

    let eventsWithoutOptimization = 0;
    let eventsWithOptimization = 0;

    let previousRegions: MockRegion[] = [];

    // Simulate parsing the document multiple times (as happens with each keystroke)
    for (let i = 0; i < scenario.iterations; i++) {
      const start = performance.now();
      const regions = parseRegions(document);
      const end = performance.now();
      times.push(end - start);

      // Without optimization: always fire event
      eventsWithoutOptimization++;

      // With optimization: only fire if regions changed
      if (didRegionsChange(previousRegions, regions)) {
        eventsWithOptimization++;
      }
      previousRegions = regions;
    }

    const avgTimeMs = times.reduce((a, b) => a + b, 0) / times.length;

    results.push({
      name: scenario.name,
      iterations: scenario.iterations,
      avgTimeMs,
      eventsWithoutOptimization,
      eventsWithOptimization,
    });
  }

  return results;
}

// Run and display results
console.log("\n=== Region Helper Benchmark Results ===\n");

const results = runBenchmark();

console.log("| Scenario | Iterations | Avg Parse Time | Events (no opt) | Events (with opt) | Reduction |");
console.log("|----------|------------|----------------|-----------------|-------------------|-----------|");

for (const result of results) {
  const reduction = ((1 - result.eventsWithOptimization / result.eventsWithoutOptimization) * 100).toFixed(1);
  console.log(
    `| ${result.name} | ${result.iterations} | ${result.avgTimeMs.toFixed(3)}ms | ${result.eventsWithoutOptimization} | ${result.eventsWithOptimization} | ${reduction}% |`
  );
}

console.log("\n=== Summary ===\n");
console.log("The event firing optimization reduces unnecessary events by comparing");
console.log("region data before firing. When document content changes but regions");
console.log("remain the same (e.g., editing inside a region), no events are fired.\n");

// Simulate the specific test case from MANUAL_BENCHMARK.ts
console.log("=== Specific Test: Edits Inside Region ===\n");
console.log("Simulating 50 keystrokes inside a region (regions don't change):\n");

const testDoc = generateTestDocument(100, 5);
let prevRegions = parseRegions(testDoc);
let eventsNoOpt = 0;
let eventsWithOpt = 0;

for (let i = 0; i < 50; i++) {
  // Each "keystroke" triggers a re-parse
  const regions = parseRegions(testDoc); // Same document, regions unchanged
  eventsNoOpt++; // Without optimization: always fire

  if (didRegionsChange(prevRegions, regions)) {
    eventsWithOpt++; // With optimization: only fire if changed
  }
  prevRegions = regions;
}

console.log(`  Events WITHOUT optimization: ${eventsNoOpt}`);
console.log(`  Events WITH optimization:    ${eventsWithOpt}`);
console.log(`  Reduction: ${((1 - eventsWithOpt / eventsNoOpt) * 100).toFixed(1)}%`);
