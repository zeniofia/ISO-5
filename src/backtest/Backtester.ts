/**
 * Simple backtesting framework for ISO-5
 * Replays historical market data and runs the core engine logic
 */

import fs from 'fs';
import { IsoFiveCore } from '../engine/IsoFiveCore';
import { MarketData } from '../strategies/MomentumClaw';

export interface BacktestResult {
  trades: number;
  winRate: number;
  totalPnL: number;
  periodStart: number;
  periodEnd: number;
}

export class Backtester {
  private core: IsoFiveCore;
  private history: MarketData[] = [];

  constructor(core: IsoFiveCore) {
    this.core = core;
  }

  /**
   * load CSV file with columns timestamp,price
   */
  public loadCsv(path: string) {
    const raw = fs.readFileSync(path, 'utf-8');
    const lines = raw.trim().split('\n');
    for (const ln of lines) {
      const [ts, price] = ln.split(',');
      this.history.push({ timestamp: Number(ts), price: Number(price) });
    }
  }

  /**
   * run through history, feeding core.tick() manually
   */
  public run(): BacktestResult {
    if (this.history.length === 0) {
      throw new Error('No data loaded');
    }

    const start = this.history[0].timestamp;
    const end = this.history[this.history.length - 1].timestamp;

    // monkey-patch provider to use history
    (this.core as any).provider.fetchMarketData = async () => {
      const current = this.history.shift();
      if (!current) throw new Error('no more data');
      return current;
    };

    // run until data exhausted
    const loop = async () => {
      while (this.history.length > 0) {
        await (this.core as any).tick();
      }
    };

    // execute synchronously for now
    // @ts-ignore
    loop()
      .then(() => console.log('Backtest complete'))
      .catch(console.error);

    // gather final stats
    const metrics = this.core.getStatus();
    return {
      trades: metrics.performance.totalTrades,
      winRate: metrics.performance.winRate,
      totalPnL: metrics.performance.totalPnL,
      periodStart: start,
      periodEnd: end
    };
  }
}
