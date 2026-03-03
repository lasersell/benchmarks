import { createJupiterApiClient } from "@jup-ag/api";
import { VersionedTransaction } from "@solana/web3.js";
import type { Config } from "../config.js";
import type { BenchmarkMethod, TxInfo } from "../runner.js";

const SOL_MINT = "So11111111111111111111111111111111111111112";

export function createJupiterMethod(config: Config): BenchmarkMethod | null {
  if (!config.jupiterApiKey) {
    console.warn("  ⚠ Skipping Jupiter's Metis API: JUPITER_API_KEY not set");
    return null;
  }

  const client = createJupiterApiClient({ apiKey: config.jupiterApiKey });

  return {
    name: "Jupiter's Metis API",
    async run(): Promise<TxInfo> {
      const quote = await client.quoteGet({
        inputMint: config.mint,
        outputMint: SOL_MINT,
        amount: config.amountTokens,
        slippageBps: config.slippageBps,
      });

      const res = await client.swapPost({
        swapRequest: {
          userPublicKey: config.wallet,
          quoteResponse: quote,
          dynamicComputeUnitLimit: true,
          prioritizationFeeLamports: {
            jitoTipLamports: 5_000_000,
          },
        },
      });

      const buf = Buffer.from(res.swapTransaction, "base64");
      const tx = VersionedTransaction.deserialize(buf);
      return {
        instructions: tx.message.compiledInstructions.length,
      };
    },
  };
}
