import { InventoryService } from './inventory-service';

export class PnLService {
  private prevUSDT = 0;
  private pnl = 0;
  private inventoryService: InventoryService;
  private currentPrice: number = 0;

  constructor(inventoryService: InventoryService) {
    this.inventoryService = inventoryService;
  }

  updatePnl = (token: string, stable: string) => {
    const inventoryToken = this.inventoryService.getInventory(token);
    const inventoryStable = this.inventoryService.getInventory(stable);
    const tokenToStable = inventoryToken * this.currentPrice;
    this.prevUSDT = tokenToStable + inventoryStable;
    this.pnl = this.prevUSDT - this.pnl;
  };

  getPnl = () => {
    return this.pnl;
  };

  updateCurrentPrice = (price: number) => {
    this.currentPrice = price;
  };
}
