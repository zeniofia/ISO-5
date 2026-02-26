import dotenv from 'dotenv';
import { MomentumClaw } from '../strategies/MomentumClaw';
import { PolymarketProvider } from '../integrations/PolymarketProvider';
import { RiskManager, RiskConfig } from '../risk/RiskManager';
import { PerformanceTracker } from '../analytics/PerformanceTracker';
import { Telemetry } from '../telemetry/Telemetry';

dotenv.config();

interface CircuitBreaker {
  losses: number;
  paused: boolean;
}

export class IsoFiveCore {
  private provider: PolymarketProvider;
  private strategy: MomentumClaw;
  private riskManager: RiskManager;
  private perfTracker: PerformanceTracker;
  private telemetry: Telemetry;
  private circuit: CircuitBreaker = { losses: 0, paused: false };
  private currentInterval: number = -1;
  private lastPrice: number | null = null;

  constructor(initialBalance: number = 10000) {
    this.provider = new PolymarketProvider(process.env.POLY_API_KEY!);
    this.strategy = new MomentumClaw();
    this.telemetry = new Telemetry();

    const riskConfig: RiskConfig = {
      riskPerTrade: 2,
      maxDrawdown: 20,
      maxPositionSize: 5000,
      stopLossPercent: 2,
      takeProfitPercent: 5,
      maxLeverage: 1.0
    };

    this.riskManager = new RiskManager(riskConfig, initialBalance);
    this.perfTracker = new PerformanceTracker(initialBalance);

    this.telemetry.info('ISO-5 Core initialized', {
      balance: initialBalance,
      config: riskConfig
    });
  }

  public start() {
    this.telemetry.info('ISO-5 agent starting');
    setInterval(() => this.tick(), 15_000); // claw every 15s
  }

  private async tick() {
    try {
      if (this.circuit.paused) {
        return;
      }

      const now = Math.floor(Date.now() / 1000);
      const interval = Math.floor(now / 300);

      // always fetch data for warmup / velocity calculation
      const data = await this.provider.fetchMarketData();
      this.strategy.update(data);

      // Check for exits on current price
      if (this.lastPrice !== null) {
        const exits = this.riskManager.checkExits(data.price);
        if (exits.liquidated.length > 0) {
          this.telemetry.warn('Positions stopped out', {
            count: exits.liquidated.length
          });
        }
      }

      this.lastPrice = data.price;

      if (interval !== this.currentInterval) {
        // start of new 5m candle
        this.currentInterval = interval;
        const signal = this.strategy.evaluate();
        if (signal) {
          this.executeTrade(signal, data.price);
        }
      }
    } catch (err) {
      this.telemetry.error('Tick error', { error: String(err) });
    }
  }

  private async executeTrade(signal: 'LONG' | 'SHORT', price: number) {
    try {
      // Calculate position size based on risk management
      const qty = this.riskManager.calculatePositionSize(price);

      if (qty <= 0) {
        this.telemetry.warn('Position size invalid', { qty });
        return;
      }

      // Create position with SL/TP
      const pos = this.riskManager.createPosition(signal, price, qty);

      if (!pos) {
        this.telemetry.warn('Risk manager blocked trade');
        return;
      }

      // Execute on provider
      const result = await this.provider.execute(signal);

      this.telemetry.info('Trade executed', {
        signal,
        price,
        qty,
        sl: pos.stopLoss,
        tp: pos.takeProfit
      });

      this.handleResult(result, price);
    } catch (err) {
      this.telemetry.error('Trade execution failed', { error: String(err) });
    }
  }

  private handleResult(result: { profit: number }, price: number) {
    if (result.profit < 0) {
      this.circuit.losses++;
      if (this.circuit.losses >= 3) {
        this.circuit.paused = true;
        this.telemetry.warn('Circuit breaker triggered (3 losses)');
      }
    } else {
      this.circuit.losses = 0;
    }

    // Track performance
    this.perfTracker.recordTrade(price, price, 'LONG', 1, Date.now() / 1000);

    // Log metrics every 10 trades
    const stats = this.perfTracker.getStats();
    if (stats.totalTrades % 10 === 0) {
      this.telemetry.info('Performance snapshot', stats);
    }

    const riskMetrics = this.riskManager.getMetrics();
    this.telemetry.debug('Risk metrics', riskMetrics);
  }

  public getStatus() {
    return {
      circuit: this.circuit,
      risk: this.riskManager.getMetrics(),
      performance: this.perfTracker.getStats(),
      lastPrice: this.lastPrice
    };
  }

  public getLogs(limit: number = 50) {
    return this.telemetry.getLogs({ limit });
  }
}

// if run directly
if (require.main === module) {
  const core = new IsoFiveCore();
  core.start();
}
