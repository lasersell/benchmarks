import { ExitApiClient } from "@lasersell/lasersell-sdk/exit-api";
import { VersionedTransaction } from "@solana/web3.js";
import type { Config } from "../config.js";
import type { BenchmarkMethod, TxInfo } from "../runner.js";

export function createLasersellMethod(config: Config): BenchmarkMethod {
  const client = ExitApiClient.withOptions(config.lasersellApiKey, {
    retry_policy: {
      max_attempts: 1,
      initial_backoff_ms: 0,
      max_backoff_ms: 0,
      jitter_ms: 0,
    },
    attempt_timeout_ms: 30_000,
  });

  return {
    name: "LaserSell API",
    async run(): Promise<TxInfo> {
      const res = await client.buildSellTx({
        mint: config.mint,
        user_pubkey: config.wallet,
        amount_tokens: config.amountTokens,
        slippage_bps: config.slippageBps,
        output: "SOL",
      });

      const buf = Buffer.from(res.tx, "base64");
      const tx = VersionedTransaction.deserialize(buf);
      return {
        instructions: tx.message.compiledInstructions.length,
      };
    },
  };
}
