# LaserSell Benchmarks

Open-source benchmarks comparing Solana transaction build latency across LaserSell API, PumpFun SDK, PumpPortal API, and Jupiter's Metis API.

## Benchmark Results

Ran locally on a MacBook Pro. Each method got 1 warmup run (discarded) followed by 20 timed iterations, with a 2s delay between runs. All tests used the exact same RPC and token to eliminate variables.

**Buy transaction build** (0.01 SOL, 20% slippage):

```
┌───────────────────────┬───────────┬───────────┬───────────┬───────────┬────────┬───────────────────────────┐
│ Method                │    Avg ms │    Min ms │    Max ms │    Med ms │     Ix │ Runs (ms)                 │
├───────────────────────┼───────────┼───────────┼───────────┼───────────┼────────┼───────────────────────────┤
│ LaserSell API         │     71.21 │     62.77 │     81.30 │     71.16 │      4 │ 73.89 77.22 71.47 74.6... │
│ PumpFun SDK           │    790.94 │    278.57 │   4570.26 │    364.92 │      3 │ 403.50 280.83 294.50 2... │
│ PumpPortal API        │    151.08 │    120.96 │    246.40 │    141.44 │      9 │ 188.52 181.70 176.10 2... │
│ Jupiter's Metis API   │    179.83 │    153.17 │    370.01 │    168.11 │      8 │ 174.90 167.59 370.01 1... │
└───────────────────────┴───────────┴───────────┴───────────┴───────────┴────────┴───────────────────────────┘
```

**Sell transaction build** (1000000 tokens, 20% slippage):

```
┌───────────────────────┬───────────┬───────────┬───────────┬───────────┬────────┬───────────────────────────┐
│ Method                │    Avg ms │    Min ms │    Max ms │    Med ms │     Ix │ Runs (ms)                 │
├───────────────────────┼───────────┼───────────┼───────────┼───────────┼────────┼───────────────────────────┤
│ LaserSell API         │     74.77 │     65.13 │    108.67 │     71.72 │      3 │ 83.10 82.32 77.11 73.9... │
│ PumpFun SDK           │    541.00 │    277.65 │   2029.10 │    317.28 │      2 │ 282.83 297.54 291.79 1... │
│ PumpPortal API        │    152.08 │    111.91 │    554.96 │    120.59 │      6 │ 116.62 136.53 147.20 1... │
│ Jupiter's Metis API   │    181.73 │    155.88 │    222.54 │    174.92 │      5 │ 201.36 208.54 192.83 1... │
└───────────────────────┴───────────┴───────────┴───────────┴───────────┴────────┴───────────────────────────┘
```

## What's Compared

| Method | Build approach |
|--------|---------------|
| **LaserSell API** | Single API call — server builds the transaction |
| **PumpFun SDK** | Local build — multiple RPC calls for on-chain state, then local instruction assembly |
| **PumpPortal API** | Single API call to pumpportal.fun |
| **Jupiter's Metis API** | Two API calls — quote then swap |

## Setup

```bash
cp .env.example .env
```

Fill in your `.env`:

| Key | Required for | How to get |
|-----|-------------|------------|
| `BENCH_MINT` | All methods | Any Pump.fun token mint address |
| `BENCH_WALLET` | All methods | Your wallet pubkey (read-only, no signing) |
| `RPC_URL` | PumpFun SDK | Any Solana RPC provider (Helius, Triton, etc.) |
| `JUPITER_API_KEY` | Jupiter | Free at [portal.jup.ag](https://portal.jup.ag) |

LaserSell and PumpPortal need no API key. Methods auto-skip if their required key is missing.

## Buy Transaction Build

Measures how long it takes to build an unsigned **buy** transaction.

```bash
cd buy-tx-build
npm install && npm run build
npm run bench
```

Override defaults via CLI:

```bash
npm run bench -- --mint <MINT> --wallet <PUBKEY> --amount 0.05 --iterations 10
```

| Option | Env var | Default |
|--------|---------|---------|
| `--mint` | `BENCH_MINT` | — (required) |
| `--wallet` | `BENCH_WALLET` | — (required) |
| `--amount` | `BENCH_AMOUNT_SOL` | `0.01` |
| `--slippage-bps` | `BENCH_SLIPPAGE_BPS` | `2000` (20%) |
| `--iterations` | `BENCH_ITERATIONS` | `20` |
| `--warmup` | `BENCH_WARMUP` | `1` |

## Sell Transaction Build

Measures how long it takes to build an unsigned **sell** transaction.

```bash
cd sell-tx-build
npm install && npm run build
npm run bench
```

Override defaults via CLI:

```bash
npm run bench -- --mint <MINT> --wallet <PUBKEY> --amount 5000000 --iterations 10
```

| Option | Env var | Default |
|--------|---------|---------|
| `--mint` | `BENCH_MINT` | — (required) |
| `--wallet` | `BENCH_WALLET` | — (required) |
| `--amount` | `BENCH_AMOUNT_TOKENS` | `1000000` (smallest units) |
| `--slippage-bps` | `BENCH_SLIPPAGE_BPS` | `2000` (20%) |
| `--iterations` | `BENCH_ITERATIONS` | `20` |
| `--warmup` | `BENCH_WARMUP` | `1` |
