/**
 * Performance & Analytics Module
 * Tracks trades, P&L, win rate, and Sharpe ratio
 */

export interface TradeRecord {
  entry: number;
  exit: number;
  side: 'LONG' | 'SHORT';
  quantity: number;
  pnl: number;
  pnlPercent: number;
  timestamp: number;
  duration: number;
}

export class PerformanceTracker {
  private trades: TradeRecord[] = [];
  private startBalance: number;
  private currentBalance: number;

  constructor(startBalance: number) {
    this.startBalance = startBalance;
    this.currentBalance = startBalance;
  }

  public recordTrade(
    entry: number,
    exit: number,
    side: 'LONG' | 'SHORT',
    quantity: number,
    timestamp: number
  ): void {
    const pnl =
      side === 'LONG'
        ? (exit - entry) * quantity
        : (entry - exit) * quantity;

    const pnlPercent = (pnl / (entry * quantity)) * 100;

    const trade: TradeRecord = {
      entry,
      exit,
      side,
      quantity,
      pnl,
      pnlPercent,
      timestamp,
      duration:
        this.trades.length > 0
          ? timestamp - this.trades[this.trades.length - 1].timestamp
          : 0
    };

    this.trades.push(trade);
    this.currentBalance += pnl;
  }

  public getStats() {
    if (this.trades.length === 0) {
      return {
        totalTrades: 0,
        winRate: 0,
        profitFactor: 0,
        avgWin: 0,
        avgLoss: 0,
        totalPnL: 0,
        totalReturn: 0,
        sharpeRatio: 0
      };
    }

    const wins = this.trades.filter((t) => t.pnl > 0);
    const losses = this.trades.filter((t) => t.pnl < 0);

    const sumWins = wins.reduce((acc, t) => acc + t.pnl, 0);
    const sumLosses = Math.abs(losses.reduce((acc, t) => acc + t.pnl, 0));

    const profitFactor = sumLosses > 0 ? sumWins / sumLosses : sumWins;

    // Simple Sharpe: annualized return / std dev
    const returns = this.trades.map((t) => t.pnlPercent);
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance =
      returns.reduce((acc, r) => acc + Math.pow(r - mean, 2), 0) /
      returns.length;
    const stdDev = Math.sqrt(variance);
    const sharpeRatio =
      stdDev > 0 ? (mean / stdDev) * Math.sqrt(252) : 0;

    return {
      totalTrades: this.trades.length,
      winRate: (wins.length / this.trades.length) * 100,
      profitFactor,
      avgWin: wins.length > 0 ? sumWins / wins.length : 0,
      avgLoss: losses.length > 0 ? sumLosses / losses.length : 0,
      totalPnL: this.currentBalance - this.startBalance,
      totalReturn:
        ((this.currentBalance - this.startBalance) / this.startBalance) * 100,
      sharpeRatio
    };
  }

  public getTrades(): TradeRecord[] {
    return [...this.trades];
  }

  public getBalance(): number {
    return this.currentBalance;
  }
}
