import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export interface Config {
  mint: string;
  wallet: string;
  amountTokens: number;
  slippageBps: number;
  iterations: number;
  warmup: number;
  rpcUrl: string | undefined;
  jupiterApiKey: string | undefined;
}

/** Load .env file into process.env (simple key=value parser, no dependency). */
function loadDotenv(): void {
  // Check CWD first, then repo root (two levels up from benchmarks/xxx/)
  const candidates = [
    resolve(process.cwd(), ".env"),
    resolve(import.meta.dirname, "..", "..", ".env"),
  ];
  for (const envPath of candidates) {
    try {
      const content = readFileSync(envPath, "utf-8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx === -1) continue;
        const key = trimmed.slice(0, eqIdx).trim();
        const value = trimmed.slice(eqIdx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    } catch {
      // .env file not found at this path, try next
    }
  }
}

function cliArg(name: string): string | undefined {
  const prefix = `--${name}=`;
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith(prefix)) return arg.slice(prefix.length);
    if (arg === `--${name}`) {
      const idx = process.argv.indexOf(arg);
      return process.argv[idx + 1];
    }
  }
  return undefined;
}

export function loadConfig(): Config {
  loadDotenv();

  const mint = cliArg("mint") ?? process.env["BENCH_MINT"];
  const wallet = cliArg("wallet") ?? process.env["BENCH_WALLET"];

  if (!mint) {
    console.error("Error: --mint or BENCH_MINT is required");
    process.exit(1);
  }
  if (!wallet) {
    console.error("Error: --wallet or BENCH_WALLET is required");
    process.exit(1);
  }

  return {
    mint,
    wallet,
    amountTokens: parseInt(cliArg("amount") ?? process.env["BENCH_AMOUNT_TOKENS"] ?? "1000000", 10),
    slippageBps: parseInt(cliArg("slippage-bps") ?? process.env["BENCH_SLIPPAGE_BPS"] ?? "2000", 10),
    iterations: parseInt(cliArg("iterations") ?? process.env["BENCH_ITERATIONS"] ?? "20", 10),
    warmup: parseInt(cliArg("warmup") ?? process.env["BENCH_WARMUP"] ?? "1", 10),
    rpcUrl: process.env["RPC_URL"] || undefined,
    jupiterApiKey: process.env["JUPITER_API_KEY"] || undefined,
  };
}
