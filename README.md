# LaserSell Benchmarks

Open-source benchmarks comparing Solana transaction build latency across LaserSell API, PumpFun SDK, PumpPortal API, and Jupiter API.

## Benchmark Results

Ran locally on a MacBook Pro. Each method got 1 warmup run (discarded) followed by 5 timed iterations, with a 2s delay between runs. PumpFun SDK test used a Shyft RPC endpoint.

**Buy transaction build** (0.01 SOL, 20% slippage):

```
┌──────────────────┬───────────┬───────────┬───────────┬───────────┬────────┬───────────────────────────┐
│ Method           │    Avg ms │    Min ms │    Max ms │    Med ms │     Ix │ Runs (ms)                 │
├──────────────────┼───────────┼───────────┼───────────┼───────────┼────────┼───────────────────────────┤
│ LaserSell API    │     76.67 │     73.56 │     81.19 │     76.08 │      4 │ 77.57 76.08 73.56 74.9... │
│ PumpFun SDK      │    304.69 │    287.52 │    328.21 │    304.32 │      3 │ 287.52 328.21 290.95 3... │
│ PumpPortal API   │    158.77 │    127.63 │    210.21 │    140.43 │      9 │ 132.08 210.21 127.63 1... │
│ Jupiter API      │    221.06 │    187.86 │    248.96 │    226.68 │      8 │ 248.96 226.68 240.31 1... │
└──────────────────┴───────────┴───────────┴───────────┴───────────┴────────┴───────────────────────────┘
```

**Sell transaction build** (1000000 tokens, 20% slippage):

```
┌──────────────────┬───────────┬───────────┬───────────┬───────────┬────────┬───────────────────────────┐
│ Method           │    Avg ms │    Min ms │    Max ms │    Med ms │     Ix │ Runs (ms)                 │
├──────────────────┼───────────┼───────────┼───────────┼───────────┼────────┼───────────────────────────┤
│ LaserSell API    │     75.91 │     73.46 │     80.74 │     74.78 │      3 │ 80.74 74.07 73.46 74.7... │
│ PumpFun SDK      │    286.91 │    260.69 │    312.44 │    282.29 │      2 │ 303.76 275.38 260.69 2... │
│ PumpPortal API   │    139.97 │    113.81 │    186.52 │    136.56 │      6 │ 145.64 186.52 117.31 1... │
│ Jupiter API      │    179.67 │    169.81 │    186.17 │    182.22 │      5 │ 169.81 186.17 176.34 1... │
└──────────────────┴───────────┴───────────┴───────────┴───────────┴────────┴───────────────────────────┘
```

## What's Compared

| Method | Build approach |
|--------|---------------|
| **LaserSell API** | Single API call — server builds the transaction |
| **PumpFun SDK** | Local build — multiple RPC calls for on-chain state, then local instruction assembly |
| **PumpPortal API** | Single API call to pumpportal.fun |
| **Jupiter API** | Two API calls — quote then swap |

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
| `--iterations` | `BENCH_ITERATIONS` | `5` |
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
| `--iterations` | `BENCH_ITERATIONS` | `5` |
| `--warmup` | `BENCH_WARMUP` | `1` |
