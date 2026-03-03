# Sell Transaction Build Benchmark

Compares the latency of **building** (not sending) an unsigned Solana sell transaction across 4 methods:

| Method | What's measured |
|--------|----------------|
| **LaserSell API** | Single API call to the LaserSell exit API |
| **PumpFun SDK** | Full local build: bonding curve + global state + mint info via RPC, then local instruction assembly |
| **PumpPortal API** | Single API call to pumpportal.fun |
| **Jupiter's Metis API** | Two API calls: quote + swap to Jupiter |

All methods target the same Pump.fun token for a fair comparison.

## Setup

```bash
npm install
npm run build
```

### Required keys

Configure in the repo-root `.env` (see `../../.env.example`):

| Key | Required for | How to get |
|-----|-------------|------------|
| `RPC_URL` | PumpFun SDK method | Any Solana RPC provider (Helius, Triton, etc.) |
| `JUPITER_API_KEY` | Jupiter method | Free at [portal.jup.ag](https://portal.jup.ag) |

LaserSell and PumpPortal need no API key. PumpFun SDK and Jupiter auto-skip if their key is missing.

## Usage

```bash
npm run bench -- --mint <PUMP_FUN_TOKEN_MINT> --wallet <YOUR_WALLET_PUBKEY>
```

### Options

| Flag | Env var | Default | Description |
|------|---------|---------|-------------|
| `--mint` | `BENCH_MINT` | — | Pump.fun token mint (required) |
| `--wallet` | `BENCH_WALLET` | — | Wallet pubkey, read-only (required) |
| `--amount` | `BENCH_AMOUNT_TOKENS` | `1000000` | Token amount in smallest units |
| `--slippage-bps` | `BENCH_SLIPPAGE_BPS` | `2000` | Slippage in basis points (20%) |
| `--iterations` | `BENCH_ITERATIONS` | `5` | Timed iterations per method |
| `--warmup` | `BENCH_WARMUP` | `1` | Warmup iterations (discarded) |

## Example output

```
Sell Transaction Build Benchmark
=================================
Token:      ABC123...xyz
Wallet:     DEF456...uvw
Amount:     1000000 tokens (smallest units)
Slippage:   2000 bps (20%)
Iterations: 5 (+ 1 warmup)

┌─────────────────────┬─────────┬─────────┬─────────┬─────────┬─────────────────────────┐
│ Method              │  Avg ms │  Min ms │  Max ms │  Med ms │ Runs (ms)               │
├─────────────────────┼─────────┼─────────┼─────────┼─────────┼─────────────────────────┤
│ LaserSell API       │   42.15 │   38.90 │   48.33 │   41.20 │ 48.33 38.90 41.20 ...  │
│ PumpFun SDK         │  910.22 │  830.11 │  995.44 │  890.33 │ ...                     │
│ PumpPortal API      │  228.44 │  205.22 │  255.11 │  225.33 │ ...                     │
│ Jupiter's Metis API │  305.67 │  285.33 │  330.11 │  300.45 │ ...                     │
└─────────────────────┴─────────┴─────────┴─────────┴─────────┴─────────────────────────┘
```
