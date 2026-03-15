# LaserSell Benchmarks

Open-source benchmarks comparing Solana transaction build latency across LaserSell API, PumpFun SDK, PumpPortal API, and Jupiter's Metis API.

## Benchmark Results

### From the Exit Intelligence Stream server

TX build time as experienced by [Exit Intelligence Stream](https://www.lasersell.io) users. When the stream detects an exit condition, it calls the LaserSell API over the co-located network to build the sell transaction. This is the latency that matters for automated exits.

**Buy transaction build** (0.01 SOL, 20% slippage, 20 iterations):

```
┌───────────────────────┬───────────┬───────────┬───────────┬───────────┬────────┬───────────────────────────┐
│ Method                │    Avg ms │    Min ms │    Max ms │    Med ms │     Ix │ Runs (ms)                 │
├───────────────────────┼───────────┼───────────┼───────────┼───────────┼────────┼───────────────────────────┤
│ LaserSell API         │      4.53 │      3.39 │      6.84 │      4.10 │      4 │ 5.62 5.30 5.22 6.05 4.... │
│ PumpFun SDK           │    123.34 │    103.46 │    208.71 │    118.24 │      2 │ 134.12 208.71 108.90 1... │
│ PumpPortal API        │     65.24 │     26.18 │    264.29 │     46.34 │      4 │ 42.67 264.29 63.65 46.... │
│ Jupiter's Metis API   │     95.03 │     79.30 │    115.76 │     93.73 │      8 │ 96.66 90.61 93.75 105.... │
└───────────────────────┴───────────┴───────────┴───────────┴───────────┴────────┴───────────────────────────┘
```

**Sell transaction build** (1000000 tokens, 20% slippage, 20 iterations):

```
┌───────────────────────┬───────────┬───────────┬───────────┬───────────┬────────┬───────────────────────────┐
│ Method                │    Avg ms │    Min ms │    Max ms │    Med ms │     Ix │ Runs (ms)                 │
├───────────────────────┼───────────┼───────────┼───────────┼───────────┼────────┼───────────────────────────┤
│ LaserSell API         │      5.32 │      3.38 │     15.03 │      4.46 │      3 │ 15.03 6.13 5.45 6.77 4... │
│ PumpFun SDK           │    120.81 │     96.53 │    143.23 │    121.65 │      1 │ 143.23 133.76 129.98 1... │
│ PumpPortal API        │     80.74 │     27.75 │    576.28 │     38.18 │      4 │ 114.24 32.96 27.75 37.... │
│ Jupiter's Metis API   │    168.84 │    159.10 │    177.35 │    169.11 │      5 │ 159.10 177.10 169.60 1... │
└───────────────────────┴───────────┴───────────┴───────────┴───────────┴────────┴───────────────────────────┘
```

### From a MacBook Pro (public internet)

Standard API latency over the public internet for comparison.

**Buy transaction build** (0.01 SOL, 20% slippage, 20 iterations):

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

**Sell transaction build** (1000000 tokens, 20% slippage, 20 iterations):

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
| **LaserSell API** | Single API call. Server builds the transaction |
| **PumpFun SDK** | Local build. Multiple RPC calls for on-chain state, then local instruction assembly |
| **PumpPortal API** | Single API call to pumpportal.fun |
| **Jupiter's Metis API** | Two API calls. Quote then swap |

## Setup

```bash
cp .env.example .env
```

Fill in your `.env`:

| Key | Required for | How to get |
|-----|-------------|------------|
| `BENCH_MINT` | All methods | Any Pump.fun token mint address |
| `BENCH_WALLET` | All methods | Your wallet pubkey (read-only, no signing) |
| `LASERSELL_API_KEY` | LaserSell API | Your LaserSell API key |
| `RPC_URL` | PumpFun SDK | Any Solana RPC provider (Helius, Triton, etc.) |
| `JUPITER_API_KEY` | Jupiter | Free at [portal.jup.ag](https://portal.jup.ag) |

PumpPortal needs no API key. Methods auto-skip if their required key is missing.

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
| `--mint` | `BENCH_MINT` | (required) |
| `--wallet` | `BENCH_WALLET` | (required) |
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
| `--mint` | `BENCH_MINT` | (required) |
| `--wallet` | `BENCH_WALLET` | (required) |
| `--amount` | `BENCH_AMOUNT_TOKENS` | `1000000` (smallest units) |
| `--slippage-bps` | `BENCH_SLIPPAGE_BPS` | `2000` (20%) |
| `--iterations` | `BENCH_ITERATIONS` | `20` |
| `--warmup` | `BENCH_WARMUP` | `1` |
