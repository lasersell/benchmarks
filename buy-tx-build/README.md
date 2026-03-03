# Buy Transaction Build Benchmark

Compares the latency of **building** (not sending) an unsigned Solana buy transaction across 4 methods:

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
cp .env.example .env
# Fill in your keys in .env
npm run build
```

### Required keys

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
| `--amount` | `BENCH_AMOUNT_SOL` | `0.01` | SOL amount to buy |
| `--slippage-bps` | `BENCH_SLIPPAGE_BPS` | `2000` | Slippage in basis points (20%) |
| `--iterations` | `BENCH_ITERATIONS` | `5` | Timed iterations per method |
| `--warmup` | `BENCH_WARMUP` | `1` | Warmup iterations (discarded) |

## Example output

```
Buy Transaction Build Benchmark
================================
Token:      ABC123...xyz
Wallet:     DEF456...uvw
Amount:     0.01 SOL
Slippage:   2000 bps (20%)
Iterations: 5 (+ 1 warmup)

┌─────────────────────┬─────────┬─────────┬─────────┬─────────┬─────────────────────────┐
│ Method              │  Avg ms │  Min ms │  Max ms │  Med ms │ Runs (ms)               │
├─────────────────────┼─────────┼─────────┼─────────┼─────────┼─────────────────────────┤
│ LaserSell API       │   45.23 │   41.10 │   52.88 │   44.01 │ 52.88 41.10 44.01 ...  │
│ PumpFun SDK         │  892.45 │  810.33 │  980.12 │  875.20 │ ...                     │
│ PumpPortal API      │  234.56 │  210.11 │  260.33 │  230.45 │ ...                     │
│ Jupiter's Metis API │  312.78 │  290.44 │  340.22 │  310.56 │ ...                     │
└─────────────────────┴─────────┴─────────┴─────────┴─────────┴─────────────────────────┘
```
