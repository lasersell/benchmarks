import { VersionedTransaction } from "@solana/web3.js";
import type { Config } from "../config.js";
import type { BenchmarkMethod, TxInfo } from "../runner.js";

export function createPumpPortalMethod(config: Config): BenchmarkMethod {
  return {
    name: "PumpPortal API",
    async run(): Promise<TxInfo> {
      const resp = await fetch("https://pumpportal.fun/api/trade-local", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicKey: config.wallet,
          action: "sell",
          mint: config.mint,
          amount: config.amountTokens,
          denominatedInSol: "false",
          slippage: config.slippageBps / 100,
          priorityFee: 0.0005,
          pool: "auto",
        }),
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`PumpPortal ${resp.status}: ${text}`);
      }

      const buf = Buffer.from(await resp.arrayBuffer());
      const tx = VersionedTransaction.deserialize(buf);
      return {
        instructions: tx.message.compiledInstructions.length,
      };
    },
  };
}
