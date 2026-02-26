import { IsoFiveCore } from '../engine/IsoFiveCore';
import { Backtester } from './Backtester';

(async () => {
  const core = new IsoFiveCore(10000);
  const bt = new Backtester(core);
  bt.loadCsv('data/sample.csv');
  const res = bt.run();
  console.log('Backtest complete:', res);
})();
