import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { getMint, TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import BN from "bn.js";
import { OnlinePumpSdk, PUMP_SDK, getSellSolAmountFromTokenAmount } from "@pump-fun/pump-sdk";
import type { Config } from "../config.js";
import type { BenchmarkMethod, TxInfo } from "../runner.js";

export function createPumpFunMethod(config: Config): BenchmarkMethod | null {
  if (!config.rpcUrl) {
    console.warn("  ⚠ Skipping PumpFun SDK: RPC_URL not set");
    return null;
  }

  const connection = new Connection(config.rpcUrl, "confirmed");
  const mint = new PublicKey(config.mint);
  const user = new PublicKey(config.wallet);
  const amount = new BN(config.amountTokens);
  const slippagePct = config.slippageBps / 100;

  return {
    name: "PumpFun SDK",
    async run(): Promise<TxInfo> {
      // 1. Determine token program from mint account
      const mintAccountInfo = await connection.getAccountInfo(mint, "confirmed");
      if (!mintAccountInfo) throw new Error("Mint account not found");

      let tokenProgram: PublicKey;
      if (mintAccountInfo.owner.equals(TOKEN_2022_PROGRAM_ID)) {
        tokenProgram = TOKEN_2022_PROGRAM_ID;
      } else if (mintAccountInfo.owner.equals(TOKEN_PROGRAM_ID)) {
        tokenProgram = TOKEN_PROGRAM_ID;
      } else {
        throw new Error(`Unexpected mint owner: ${mintAccountInfo.owner.toBase58()}`);
      }

      // 2. Fetch global state and fee config
      const onlineSdk = new OnlinePumpSdk(connection);
      const global = await onlineSdk.fetchGlobal();

      let feeConfig = null;
      try {
        feeConfig = await onlineSdk.fetchFeeConfig();
      } catch {
        // Fee config may not exist on all environments
      }

      // 3. Fetch bonding curve
      const { bondingCurveAccountInfo, bondingCurve } =
        await onlineSdk.fetchBuyState(mint, user, tokenProgram);

      // 4. Get mint info for supply
      const mintInfo = await getMint(connection, mint, "confirmed", tokenProgram);
      const mintSupply = new BN(mintInfo.supply.toString());

      // 5. Calculate expected SOL output
      const solAmount = getSellSolAmountFromTokenAmount({
        global,
        feeConfig,
        mintSupply,
        bondingCurve,
        amount,
      });

      // 6. Build sell transaction instructions
      const instructions = await PUMP_SDK.sellInstructions({
        global,
        bondingCurveAccountInfo,
        bondingCurve,
        mint,
        user,
        amount,
        solAmount,
        slippage: slippagePct,
        tokenProgram,
        mayhemMode: false,
      });

      // 7. Validate: instructions were built successfully
      const tx = new Transaction().add(...instructions);
      return {
        instructions: tx.instructions.length,
      };
    },
  };
}
