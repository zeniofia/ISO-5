![ISO-5 Banner](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==)

# ISO-5: Institutional Scale Open-source 5-minute Agent

![OpenClaw Verified](https://img.shields.io/badge/OpenClaw-Verified-blue)
![Polymarket API](https://img.shields.io/badge/Polymarket-API-green)
![5m-Interval-Locked](https://img.shields.io/badge/Interval-5m--Locked-red)

A production‑grade framework built around the **OpenClaw** SDK that
specializes in high‑frequency trading on Polymarket's BTC Upside/Downside
markets. ISO-5 is opinionated: data is clawed every 15 seconds, but
trade logic only fires on the first tick of each 5‑minute candle. A
circuit breaker safeguards the agent from sustained losing streaks.

---

## 🛠️ Setup (GitHub Codespaces)

1. **Clone** the repository and open in a Codespace.
2. Copy `.env.example` to `.env` and populate values:
   ```bash
   POLY_API_KEY=...
   WALLET_PK=...
   RPC_URL=...
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Build or run in dev mode:
   ```bash
   npm run build       # compile to dist/
   npm run start       # run compiled agent
   npm run dev         # run directly with ts-node for rapid iteration
   ```

> **Tip:** Codespaces already include Node ≥18 and GitHub CLI for
> seamless environment setup.

---

## 📐 Design Theory

The core principle behind ISO‑5 is **Interval Isolation**.  While markets
are noisy at sub‑minute resolution, five‑minute candles strike a
balance between actionable momentum and noise suppression. By clawing
raw data every 15 seconds, the agent maintains fresh velocity metrics
without executing trades until the candle boundary, ensuring consistency
and repeatability across deployments.

### Why 5 minutes?

1. **Liquidity window** – Polymarket order books are deepest around
   the 5‑minute mark.
2. **Transaction cadence** – Limits gas expenditure and avoids
   over‑trading.
3. **Statistical efficiency** – 5‑minute returns show clearer momentum
   signals for BTC than 1‑minute or 1‑hour buckets.

### Circuit Breaker

A simple three‑loss rule halts the agent if three consecutive 5‑minute
trades are unprofitable. This prevents runaway drawdown during regime
shifts or API outages.

---

For developers: see `src/engine/IsoFiveCore.ts`,
`src/strategies/MomentumClaw.ts` and
`src/integrations/PolymarketProvider.ts` for extensible building blocks.

Build confidently—ISO‑5 is open, modular, and engineered for
institutional deployment. let's claw! 👊

---

## ✨ New Features

### 🛡️ Risk Management (`src/risk/RiskManager.ts`)
- **Position Sizing**: Kelly-based sizing with configurable risk per trade
- **Stop-Loss / Take-Profit**: Automatic SL/TP levels on every position
- **Drawdown Limits**: Max drawdown % threshold to pause trading
- **Position Caps**: Max notional value per trade enforced

**Config:**
```ts
const riskConfig: RiskConfig = {
  riskPerTrade: 2,           // 2% per trade
  maxDrawdown: 20,           // pause if down 20%
  maxPositionSize: 5000,     // max USD per trade
  stopLossPercent: 2,        // 2% SL
  takeProfitPercent: 5,      // 5% TP
  maxLeverage: 1.0
};
```

### 📊 Performance Analytics (`src/analytics/PerformanceTracker.ts`)
- **Trade History**: Record every entry/exit with PnL
- **Win Rate**: Win % tracking
- **Sharpe Ratio**: Risk-adjusted returns (annualized)
- **Profit Factor**: Ratio of gross wins to gross losses
- **CSV Export**: Export all trades for external analysis

**Metrics snapshot every 10 trades:**
```json
{
  "totalTrades": 100,
  "winRate": 52.5,
  "sharpeRatio": 1.23,
  "totalReturn": 18.5,
  "totalPnL": 1850
}
```

### 📡 Real-Time Telemetry (`src/telemetry/Telemetry.ts`)
- **Structured Logging**: DEBUG, INFO, WARN, ERROR levels
- **Event History**: Last 1000 events in memory
- **Query Logs**: Filter by level, limit, export to CSV
- **Error Tracking**: Capture and report last error

**Usage:**
```ts
telemetry.info('[Trade]', { signal: 'LONG', price: 45230 });
telemetry.warn('SL triggered', { amount: -250 });
const logs = telemetry.getLogs({ level: 'ERROR', limit: 20 });
```

---

## 🏗️ Architecture

```
src/
├── engine/          IsoFiveCore orchestrator with risk integration
├── strategies/      MomentumClaw (extend with RSI, MACD, etc.)
├── integrations/    PolymarketProvider (CLOB/Gamma calls)
├── risk/            RiskManager (position sizing, stops)
├── analytics/       PerformanceTracker (stats & PnL)
└── telemetry/       Telemetry (logging & monitoring)
```

All modules are injectable and testable. Extend `MomentumClaw` to add new signal types, or swap `PolymarketProvider` for other market connectors.

---

## 🧪 Backtesting

The `Backtester` class allows you to replay historical candle data
(e.g. CSV of timestamp,price) and drive the ISO‑5 engine offline.  It
monkey‑patches the provider to feed pre‑recorded prices and records all
trade history using the normal performance tracker.

**Usage example**:
```ts
import { IsoFiveCore } from './src/engine/IsoFiveCore';
import { Backtester } from './src/backtest/Backtester';

const core = new IsoFiveCore(10000);
const bt = new Backtester(core);
bt.loadCsv('data/btc_5m.csv');
const result = bt.run();
console.log('Result', result);
```

### Interpreting results
- `trades` – total executed orders
- `winRate` – % profitable trades
- `totalPnL` – net profit over the period
- `periodStart` / `periodEnd` – covered timeframe

The output metrics mirror what you’d see in live `core.getStatus()`.

---

# Key Features

* **Modern ES6+ JavaScript features**: Advanced implementation with optimized performance and comprehensive error handling.
* **Asynchronous programming patterns**: Advanced implementation with optimized performance and comprehensive error handling.
* **Modular component architecture**: Advanced implementation with optimized performance and comprehensive error handling.
* **Cross-browser compatibility**: Advanced implementation with optimized performance and comprehensive error handling.
* **Responsive design principles**: Advanced implementation with optimized performance and comprehensive error handling.

# Technology Stack

* **Javascript**: Primary development language providing performance, reliability, and extensive ecosystem support.
* **Modern tooling**: Utilizing contemporary development tools and frameworks for enhanced productivity.
* **Testing frameworks**: Comprehensive testing infrastructure ensuring code quality and reliability.

# Installation

To install CorGun, follow these steps:

1. Clone the repository:


2. Follow the installation instructions in the documentation for your specific environment.

# Configuration

CorGun supports various configuration options to customize behavior and optimize performance for your specific use case. Configuration can be managed through environment variables, configuration files, or programmatic settings.

## # Configuration Options

The following configuration parameters are available:

* **Verbose Mode**: Enable detailed logging for debugging purposes
* **Output Format**: Customize the output format (JSON, CSV, XML)
* **Performance Settings**: Adjust memory usage and processing threads
* **Network Settings**: Configure timeout and retry policies

# Contributing

Contributions to CorGun are welcome and appreciated! We value community input and encourage developers to help improve this project.

## # How to Contribute

1. Fork the CorGun repository.
2. Create a new branch for your feature or fix.
3. Implement your changes, ensuring they adhere to the project's coding standards and guidelines.
4. Submit a pull request, providing a detailed description of your changes.

## # Development Guidelines

* Follow the existing code style and formatting conventions
* Write comprehensive tests for new features
* Update documentation when adding new functionality
* Ensure all tests pass before submitting your pull request

# License

This project is licensed under the MIT License. See the [LICENSE](https://github.com/Hstkj23/CorGun/blob/main/LICENSE) file for details.
