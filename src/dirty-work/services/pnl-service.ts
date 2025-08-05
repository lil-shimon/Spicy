import type { InventoryService } from './inventory-service';

export class PnLService {
  private pnl = 0;
  private initialUSDT = 0;
  private inventoryService: InventoryService;
  private currentPrice: number = 0;

  constructor(inventoryService: InventoryService) {
    this.inventoryService = inventoryService;
  }

  initialize = (price: number, token: string, stable: string) => {
    const initialUSDT =
      this.inventoryService.getInventory(stable) +
      this.inventoryService.getInventory(token) * price;
    this.initialUSDT = initialUSDT;
    console.log('initialize', initialUSDT);
  };

  updatePnl = (token: string, stable: string) => {
    const inventoryToken = this.inventoryService.getInventory(token);
    const inventoryStable = this.inventoryService.getInventory(stable);
    const tokenToStable = inventoryToken * this.currentPrice;
    this.pnl = tokenToStable + inventoryStable - this.initialUSDT;
  };

  getPnl = () => {
    return this.pnl;
  };

  updateCurrentPrice = (price: number) => {
    this.currentPrice = price;
  };

  getInitialUSDT = () => {
    return this.initialUSDT;
  };
}
