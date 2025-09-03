import { ArbitrageController } from './controllers/arbitrage.controller';

const arbitrageController = ArbitrageController();

const main = async () => {
  arbitrageController.start({});
};

main();
