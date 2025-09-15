import { ArbitrageController } from './controllers/arbitrage.controller';

const arbitrageController = ArbitrageController();

const EXCHANGE_RATE_ARBITRAGE_ENABLED: string = 'true';
const TRIANGLE_ARBITRAGE_ENABLED: string = 'false';

const main = async () => {
  if (TRIANGLE_ARBITRAGE_ENABLED === 'true') {
    arbitrageController.start({});
  }
  if (EXCHANGE_RATE_ARBITRAGE_ENABLED === 'true') {
    arbitrageController.exchangeRateArbitrageStart();
  }
};

main();
