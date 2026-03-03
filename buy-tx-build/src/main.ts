import { loadConfig } from "./config.js";
import { runBenchmark, type BenchmarkMethod, type BenchmarkResult } from "./runner.js";
import { printResults } from "./table.js";
import { createLasersellMethod } from "./methods/lasersell.js";
import { createPumpPortalMethod } from "./methods/pumpportal.js";
import { createJupiterMethod } from "./methods/jupiter.js";
import { createPumpFunMethod } from "./methods/pumpfun.js";

async function main() {
  const config = loadConfig();

  console.log("Initializing methods...");

  const factories: Array<{ create: () => BenchmarkMethod | null; name: string }> = [
    { name: "LaserSell API", create: () => createLasersellMethod(config) },
    { name: "PumpFun SDK", create: () => createPumpFunMethod(config) },
    { name: "PumpPortal API", create: () => createPumpPortalMethod(config) },
    { name: "Jupiter's Metis API", create: () => createJupiterMethod(config) },
  ];

  const methods: Array<{ method: BenchmarkMethod | null; name: string }> = [];
  for (const f of factories) {
    methods.push({ method: f.create(), name: f.name });
  }

  console.log();

  const results: BenchmarkResult[] = [];

  for (const { method, name } of methods) {
    if (!method) {
      results.push({
        name,
        timesMs: [],
        txInfo: null,
        errors: [],
        skipped: true,
        skipReason: "missing config",
      });
      continue;
    }

    console.log(`Running ${method.name}...`);
    const result = await runBenchmark(method, config.warmup, config.iterations);
    results.push(result);

    const ok = result.timesMs.length;
    const fail = result.errors.length;
    if (fail === 0) {
      console.log(`  ${ok}/${config.iterations} OK`);
    } else {
      console.log(`  ${ok}/${config.iterations} OK, ${fail} errors`);
    }
  }

  printResults(config, results);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
