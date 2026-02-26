import dotenv from 'dotenv';
import { MomentumClaw } from '../strategies/MomentumClaw';
import { PolymarketProvider } from '../integrations/PolymarketProvider';

dotenv.config();

interface CircuitBreaker {
  losses: number;
  paused: boolean;
}

export class IsoFiveCore {
  private provider: PolymarketProvider;
  private strategy: MomentumClaw;
  private circuit: CircuitBreaker = { losses: 0, paused: false };
  private currentInterval: number = -1;

  constructor() {
    this.provider = new PolymarketProvider(process.env.POLY_API_KEY!);
    this.strategy = new MomentumClaw();
  }

  public start() {
    console.log('[ISO-5] starting agent');
    setInterval(() => this.tick(), 15_000); // claw every 15s
  }

  private async tick() {
    if (this.circuit.paused) {
      return;
    }

    const now = Math.floor(Date.now() / 1000);
    const interval = Math.floor(now / 300);

    // always fetch data for warmup / velocity calculation
    const data = await this.provider.fetchMarketData();
    this.strategy.update(data);

    if (interval !== this.currentInterval) {
      // start of new 5m candle
      this.currentInterval = interval;
      const signal = this.strategy.evaluate();
      if (signal) {
        const result = await this.provider.execute(signal);
        this.handleResult(result);
      }
    }
  }

  private handleResult(result: { profit: number }) {
    if (result.profit < 0) {
      this.circuit.losses++;
      if (this.circuit.losses >= 3) {
        console.warn('[ISO-5] circuit breaker triggered, pausing agent');
        this.circuit.paused = true;
      }
    } else {
      this.circuit.losses = 0;
    }
  }
}

// if run directly
if (require.main === module) {
  const core = new IsoFiveCore();
  core.start();
}
