export interface TxInfo {
  /** Number of instructions in the transaction */
  instructions: number;
}

export interface BenchmarkResult {
  name: string;
  timesMs: number[];
  txInfo: TxInfo | null;
  errors: string[];
  skipped: boolean;
  skipReason?: string;
}

export interface BenchmarkMethod {
  name: string;
  run: () => Promise<TxInfo>;
}

const DELAY_MS = 2_000;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function runBenchmark(
  method: BenchmarkMethod,
  warmup: number,
  iterations: number,
): Promise<BenchmarkResult> {
  const result: BenchmarkResult = {
    name: method.name,
    timesMs: [],
    txInfo: null,
    errors: [],
    skipped: false,
  };

  // Warmup iterations (discarded)
  for (let i = 0; i < warmup; i++) {
    try {
      await method.run();
    } catch {
      // Warmup failures are fine, just continue
    }
    await sleep(DELAY_MS);
  }

  // Timed iterations
  for (let i = 0; i < iterations; i++) {
    if (i > 0) await sleep(DELAY_MS);
    const start = process.hrtime.bigint();
    try {
      const txInfo = await method.run();
      const elapsed = process.hrtime.bigint() - start;
      result.timesMs.push(Number(elapsed) / 1_000_000);
      // Keep the last successful tx info for display
      result.txInfo = txInfo;
    } catch (err) {
      const elapsed = process.hrtime.bigint() - start;
      const msg = err instanceof Error ? err.message : String(err);
      result.errors.push(`Run ${i + 1}: ${msg} (${(Number(elapsed) / 1_000_000).toFixed(0)}ms)`);
    }
  }

  return result;
}

export function computeStats(times: number[]): { avg: number; min: number; max: number; median: number } {
  if (times.length === 0) return { avg: 0, min: 0, max: 0, median: 0 };

  const sorted = [...times].sort((a, b) => a - b);
  const sum = sorted.reduce((a, b) => a + b, 0);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 0
    ? (sorted[mid - 1]! + sorted[mid]!) / 2
    : sorted[mid]!;

  return {
    avg: sum / sorted.length,
    min: sorted[0]!,
    max: sorted[sorted.length - 1]!,
    median,
  };
}
