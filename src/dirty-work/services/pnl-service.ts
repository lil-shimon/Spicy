import type { InventoryService } from './inventory-service';

export const createPnLService = (inventoryService: InventoryService) => {
  let pnl = 0;
  let initialUSDT = 0;
  let currentPrice = 0;

  return {
    initialize: (price: number, token: string, stable: string) => {
      initialUSDT =
        inventoryService.getInventory(stable) +
        inventoryService.getInventory(token) * price;
      console.log('initialize', initialUSDT);
    },

    updatePnl: (token: string, stable: string) => {
      const inventoryToken = inventoryService.getInventory(token);
      const inventoryStable = inventoryService.getInventory(stable);
      const tokenToStable = inventoryToken * currentPrice;
      pnl = tokenToStable + inventoryStable - initialUSDT;
    },

    updateCurrentPrice: (price: number) => {
      currentPrice = price;
    },

    getPnl: () => pnl,
    getInitialUSDT: () => initialUSDT,
    getCurrentPrice: () => currentPrice,
  };
};
