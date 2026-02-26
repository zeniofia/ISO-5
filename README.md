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
