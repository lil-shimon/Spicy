import { ArbitrageController } from './controllers/arbitrage.controller';

const arbitrageController = ArbitrageController();

const EXCHANGE_RATE_ARBITRAGE_ENABLED: string =
  process.env.EXCHANGE_RATE_ARBITRAGE_ENABLED || 'false';
const TRIANGLE_ARBITRAGE_ENABLED: string =
  process.env.TRIANGLE_ARBITRAGE_ENABLED || 'false';

const main = async () => {
  if (TRIANGLE_ARBITRAGE_ENABLED === 'true') {
    console.log('三角アビトラを開始します');
    arbitrageController.start({});
  }
  if (EXCHANGE_RATE_ARBITRAGE_ENABLED === 'true') {
    console.log('為替アビトラを開始します');
    arbitrageController.exchangeRateArbitrageStart();
  }
};

main();
