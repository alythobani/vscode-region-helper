/**
 * Benchmark utilities for measuring Region Helper extension performance.
 *
 * These utilities can be imported and run during development to measure
 * the impact of changes on extension performance.
 */

export type BenchmarkResult = {
  name: string;
  iterations: number;
  totalTimeMs: number;
  averageTimeMs: number;
  minTimeMs: number;
  maxTimeMs: number;
};

export type EventCountResult = {
  eventName: string;
  editCount: number;
  eventsFired: number;
  ratio: number;
};

/**
 * Measures the execution time of a function over multiple iterations.
 */
export function measurePerformance(
  name: string,
  fn: () => void,
  iterations = 100
): BenchmarkResult {
  const times: number[] = [];

  // Warm up
  for (let i = 0; i < 10; i++) {
    fn();
  }

  // Actual measurement
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    fn();
    const end = performance.now();
    times.push(end - start);
  }

  const totalTimeMs = times.reduce((a, b) => a + b, 0);
  const averageTimeMs = totalTimeMs / iterations;
  const minTimeMs = Math.min(...times);
  const maxTimeMs = Math.max(...times);

  return {
    name,
    iterations,
    totalTimeMs,
    averageTimeMs,
    minTimeMs,
    maxTimeMs,
  };
}

/**
 * Measures async function performance.
 */
export async function measureAsyncPerformance(
  name: string,
  fn: () => Promise<void>,
  iterations = 100
): Promise<BenchmarkResult> {
  const times: number[] = [];

  // Warm up
  for (let i = 0; i < 5; i++) {
    await fn();
  }

  // Actual measurement
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await fn();
    const end = performance.now();
    times.push(end - start);
  }

  const totalTimeMs = times.reduce((a, b) => a + b, 0);
  const averageTimeMs = totalTimeMs / iterations;
  const minTimeMs = Math.min(...times);
  const maxTimeMs = Math.max(...times);

  return {
    name,
    iterations,
    totalTimeMs,
    averageTimeMs,
    minTimeMs,
    maxTimeMs,
  };
}

/**
 * Formats benchmark results as a markdown table row.
 */
export function formatResultRow(result: BenchmarkResult): string {
  return `| ${result.name} | ${result.iterations} | ${result.averageTimeMs.toFixed(3)}ms | ${result.minTimeMs.toFixed(3)}ms | ${result.maxTimeMs.toFixed(3)}ms |`;
}

/**
 * Formats event count results as a markdown table row.
 */
export function formatEventCountRow(result: EventCountResult): string {
  return `| ${result.eventName} | ${result.editCount} | ${result.eventsFired} | ${(result.ratio * 100).toFixed(1)}% |`;
}

/**
 * Generates a large test file content with many regions for stress testing.
 */
export function generateLargeTestFile(lineCount: number, regionCount: number): string {
  const lines: string[] = [];
  const linesPerRegion = Math.floor(lineCount / regionCount);

  for (let r = 0; r < regionCount; r++) {
    lines.push(`// #region Region${r + 1}`);

    for (let l = 0; l < linesPerRegion - 2; l++) {
      lines.push(`const var${r}_${l} = ${l};`);
    }

    lines.push(`// #endregion`);
  }

  return lines.join("\n");
}

/**
 * Console output formatting for benchmark results.
 */
export function printBenchmarkResults(results: BenchmarkResult[]): void {
  console.log("\n=== Benchmark Results ===\n");
  console.log("| Test | Iterations | Avg Time | Min Time | Max Time |");
  console.log("|------|------------|----------|----------|----------|");
  for (const result of results) {
    console.log(formatResultRow(result));
  }
  console.log("");
}

/**
 * Console output formatting for event count results.
 */
export function printEventCountResults(results: EventCountResult[]): void {
  console.log("\n=== Event Firing Results ===\n");
  console.log("| Event | Edits | Events Fired | Fire Rate |");
  console.log("|-------|-------|--------------|-----------|");
  for (const result of results) {
    console.log(formatEventCountRow(result));
  }
  console.log("");
}
