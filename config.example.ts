/**
 * ISO-5 Configuration & Usage Example
 * This file demonstrates how to instantiate and configure the full framework
 */

import { IsoFiveCore } from './src/engine/IsoFiveCore';

// Initialize the agent with custom starting balance
const agent = new IsoFiveCore(50000); // $50k starting capital

// Start the 5-minute trading loop
agent.start();

// Monitor status every 60 seconds
setInterval(() => {
  const status = agent.getStatus();
  console.log('\n=== ISO-5 Status ===');
  console.log('Circuit Status:', {
    paused: status.circuit.paused,
    losses: status.circuit.losses
  });
  console.log('Risk Metrics:', status.risk);
  console.log('Performance:', status.performance);
  console.log('Last Price:', status.lastPrice);
  console.log('====================\n');
}, 60_000);

// Export logs to file periodically (every 5 minutes)
setInterval(() => {
  const logs = agent.getLogs(100);
  const csv = logs
    .map(
      (l) =>
        `${new Date(l.timestamp * 1000).toISOString()},${l.level},"${l.message.replace(/"/g, '""')}"`
    )
    .join('\n');
  console.log('[LOG EXPORT]', csv);
}, 300_000);

// Graceful shutdown on SIGINT
process.on('SIGINT', () => {
  console.log('\nShutting down ISO-5 gracefully...');
  const final = agent.getStatus();
  console.log('Final Performance:', final.performance);
  process.exit(0);
});

export default agent;
