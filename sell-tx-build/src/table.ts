import type { Config } from "./config.js";
import { computeStats, type BenchmarkResult } from "./runner.js";

function pad(s: string, len: number, align: "left" | "right" = "left"): string {
  return align === "right" ? s.padStart(len) : s.padEnd(len);
}

function fmt(n: number): string {
  return n.toFixed(2);
}

function truncate(s: string, len: number): string {
  if (s.length <= len) return s;
  return s.slice(0, len - 3) + "...";
}

const METHOD_NOTES: Record<string, string> = {
  "LaserSell API": "Single API call (network latency to LaserSell server)",
  "PumpFun SDK": "Local build + RPC calls (bonding curve, global state, mint info)",
  "PumpPortal API": "Single API call (network latency to pumpportal.fun)",
  "Jupiter API": "Two API calls: quote + swap (network latency to Jupiter servers)",
};

export function printResults(config: Config, results: BenchmarkResult[]): void {
  console.log();
  console.log("Sell Transaction Build Benchmark");
  console.log("=================================");
  console.log(`Token:      ${config.mint}`);
  console.log(`Wallet:     ${config.wallet}`);
  console.log(`Amount:     ${config.amountTokens} tokens (smallest units)`);
  console.log(`Slippage:   ${config.slippageBps} bps (${config.slippageBps / 100}%)`);
  console.log(`Iterations: ${config.iterations} (+ ${config.warmup} warmup)`);
  console.log();

  // Column widths
  const colMethod = 18;
  const colStat = 9;
  const colTx = 6;
  const colRuns = 25;

  const hdr = [
    pad("Method", colMethod),
    pad("Avg ms", colStat, "right"),
    pad("Min ms", colStat, "right"),
    pad("Max ms", colStat, "right"),
    pad("Med ms", colStat, "right"),
    pad("Ix", colTx, "right"),
    pad("Runs (ms)", colRuns),
  ];

  const sep = hdr.map((h) => "─".repeat(h.length));

  console.log(`┌${sep.map((s) => `─${s}─`).join("┬")}┐`);
  console.log(`│${hdr.map((h) => ` ${h} `).join("│")}│`);
  console.log(`├${sep.map((s) => `─${s}─`).join("┼")}┤`);

  for (const r of results) {
    if (r.skipped) {
      const cells = [
        pad(r.name, colMethod),
        pad("SKIPPED", colStat, "right"),
        pad("—", colStat, "right"),
        pad("—", colStat, "right"),
        pad("—", colStat, "right"),
        pad("—", colTx),
        pad(r.skipReason ?? "", colRuns),
      ];
      console.log(`│${cells.map((c) => ` ${c} `).join("│")}│`);
      continue;
    }

    if (r.timesMs.length === 0) {
      const cells = [
        pad(r.name, colMethod),
        pad("ERROR", colStat, "right"),
        pad("—", colStat, "right"),
        pad("—", colStat, "right"),
        pad("—", colStat, "right"),
        pad("—", colTx),
        pad(truncate(r.errors[0] ?? "all runs failed", colRuns), colRuns),
      ];
      console.log(`│${cells.map((c) => ` ${c} `).join("│")}│`);
      continue;
    }

    const stats = computeStats(r.timesMs);
    const runsStr = r.timesMs.map((t) => fmt(t)).join(" ");
    const txStr = r.txInfo
      ? String(r.txInfo.instructions)
      : "—";

    const cells = [
      pad(r.name, colMethod),
      pad(fmt(stats.avg), colStat, "right"),
      pad(fmt(stats.min), colStat, "right"),
      pad(fmt(stats.max), colStat, "right"),
      pad(fmt(stats.median), colStat, "right"),
      pad(txStr, colTx, "right"),
      pad(truncate(runsStr, colRuns), colRuns),
    ];
    console.log(`│${cells.map((c) => ` ${c} `).join("│")}│`);

    if (r.errors.length > 0) {
      const errMsg = `(${r.errors.length} error${r.errors.length > 1 ? "s" : ""})`;
      const errCells = [
        pad("", colMethod),
        pad(errMsg, colStat + 1 + colStat + 1 + colStat + 1 + colStat + 1 + colTx + 1 + colRuns + 5),
      ];
      console.log(`│ ${errCells[0]} ${errCells[1]}│`);
    }
  }

  console.log(`└${sep.map((s) => `─${s}─`).join("┴")}┘`);

  // Notes
  const activeResults = results.filter((r) => !r.skipped);
  if (activeResults.length > 0) {
    console.log();
    console.log("Notes:");
    for (const r of activeResults) {
      const note = METHOD_NOTES[r.name];
      if (note) {
        console.log(`  ${pad(r.name + ":", 18)} ${note}`);
      }
    }
  }

  // Error details
  const withErrors = results.filter((r) => r.errors.length > 0);
  if (withErrors.length > 0) {
    console.log();
    console.log("Errors:");
    for (const r of withErrors) {
      for (const e of r.errors) {
        console.log(`  ${r.name}: ${e}`);
      }
    }
  }

  console.log();
}
