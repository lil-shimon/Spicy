import { ArbitrageController } from './controllers/arbitrage.controller';

const arbitrageController = ArbitrageController();

const main = async () => {
  const symbol = 'SOL';
  arbitrageController.start({ symbol });
};

main();
