/**
 * Risk Management Module
 * Handles position sizing, stop-loss, take-profit, and drawdown limits
 */

export interface RiskConfig {
  riskPerTrade: number;          // % of account per trade (e.g., 2)
  maxDrawdown: number;           // max allowed drawdown % before pause
  maxPositionSize: number;       // max position size in USD
  stopLossPercent: number;       // e.g., 2% below entry
  takeProfitPercent: number;     // e.g., 5% above entry
  maxLeverage: number;           // default 1.0 for retail
}

export interface PositionState {
  entryPrice: number;
  quantity: number;
  side: 'LONG' | 'SHORT';
  timestamp: number;
  stopLoss: number;
  takeProfit: number;
}

export class RiskManager {
  private config: RiskConfig;
  private accountBalance: number;
  private drawdownPeak: number;
  private currentDrawdown: number = 0;
  private positions: Map<string, PositionState> = new Map();

  constructor(config: RiskConfig, initialBalance: number) {
    this.config = config;
    this.accountBalance = initialBalance;
    this.drawdownPeak = initialBalance;
  }

  /**
   * Calculate position size based on Kelly-like sizing
   */
  public calculatePositionSize(
    entryPrice: number,
    winRate: number = 0.55
  ): number {
    const riskAmount = (this.accountBalance * this.config.riskPerTrade) / 100;
    const positionSize = Math.min(
      riskAmount / entryPrice,
      this.config.maxPositionSize / entryPrice
    );
    return Math.floor(positionSize);
  }

  /**
   * Create position with auto-calculated stop/profit levels
   */
  public createPosition(
    signal: 'LONG' | 'SHORT',
    entryPrice: number,
    quantity: number
  ): PositionState | null {
    if (quantity <= 0) return null;

    const notionalValue = quantity * entryPrice;
    if (notionalValue > this.config.maxPositionSize) {
      console.warn('[Risk] Position exceeds max size limit');
      return null;
    }

    if (this.currentDrawdown > this.config.maxDrawdown) {
      console.warn('[Risk] Max drawdown exceeded, blocking new positions');
      return null;
    }

    const stopLoss =
      signal === 'LONG'
        ? entryPrice * (1 - this.config.stopLossPercent / 100)
        : entryPrice * (1 + this.config.stopLossPercent / 100);

    const takeProfit =
      signal === 'LONG'
        ? entryPrice * (1 + this.config.takeProfitPercent / 100)
        : entryPrice * (1 - this.config.takeProfitPercent / 100);

    const position: PositionState = {
      entryPrice,
      quantity,
      side: signal,
      timestamp: Math.floor(Date.now() / 1000),
      stopLoss,
      takeProfit
    };

    this.positions.set(`${signal}:${entryPrice}`, position);
    return position;
  }

  /**
   * Check if current price hits stop-loss or take-profit
   */
  public checkExits(currentPrice: number): {
    liquidated: string[];
    stopped: string[];
  } {
    const liquidated: string[] = [];
    const stopped: string[] = [];

    for (const [key, pos] of this.positions.entries()) {
      const hitSL =
        pos.side === 'LONG'
          ? currentPrice <= pos.stopLoss
          : currentPrice >= pos.stopLoss;

      const hitTP =
        pos.side === 'LONG'
          ? currentPrice >= pos.takeProfit
          : currentPrice <= pos.takeProfit;

      if (hitSL) {
        liquidated.push(key);
        this.closePosition(key, pos.stopLoss, 'stop-loss');
      } else if (hitTP) {
        stopped.push(key);
        this.closePosition(key, pos.takeProfit, 'take-profit');
      }
    }

    return { liquidated, stopped };
  }

  /**
   * Close a position and update balance
   */
  private closePosition(
    key: string,
    exitPrice: number,
    reason: string
  ): void {
    const pos = this.positions.get(key);
    if (!pos) return;

    const pnl =
      pos.side === 'LONG'
        ? (exitPrice - pos.entryPrice) * pos.quantity
        : (pos.entryPrice - exitPrice) * pos.quantity;

    this.accountBalance += pnl;
    this.updateDrawdown();

    console.log(
      `[Risk] Closed ${pos.side} @ ${exitPrice} (${reason}): PnL=${pnl}`
    );
    this.positions.delete(key);
  }

  /**
   * Track drawdown from peak
   */
  private updateDrawdown(): void {
    if (this.accountBalance > this.drawdownPeak) {
      this.drawdownPeak = this.accountBalance;
    }
    this.currentDrawdown =
      ((this.drawdownPeak - this.accountBalance) / this.drawdownPeak) * 100;
  }

  public getMetrics() {
    return {
      balance: this.accountBalance,
      drawdown: this.currentDrawdown,
      openPositions: this.positions.size,
      peak: this.drawdownPeak
    };
  }
}
