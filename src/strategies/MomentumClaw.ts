export interface MarketData {
  timestamp: number;
  price: number;
}

export type Signal = 'LONG' | 'SHORT' | null;

export class MomentumClaw {
  private history: MarketData[] = [];

  /**
   * called every 15s with latest quote
   */
  public update(data: MarketData) {
    this.history.push(data);
    if (this.history.length > 40) {
      // keep roughly last 10 minutes of samples
      this.history.shift();
    }
  }

  /**
   * decide at new 5m candle
   */
  public evaluate(): Signal {
    if (this.history.length < 2) {
      return null;
    }
    const first = this.history[0].price;
    const last = this.history[this.history.length - 1].price;
    const velocity = (last - first) / (this.history.length - 1);
    if (velocity > 0.1) {
      return 'LONG';
    }
    if (velocity < -0.1) {
      return 'SHORT';
    }
    return null;
  }
}
