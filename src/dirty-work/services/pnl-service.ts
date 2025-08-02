import { InventoryService } from './inventory-service';

export class PnLService {
  private prevUSDT = 0;
  private pnl = 0;
  private inventoryService: InventoryService;

  constructor(inventoryService: InventoryService) {
    this.inventoryService = inventoryService;
  }

  updatePnl = (token: string, stable: string, tokenPrice: number) => {
    const inventoryToken = this.inventoryService.getInventory(token);
    const inventoryStable = this.inventoryService.getInventory(stable);
    const tokenToStable = inventoryToken * tokenPrice;
    this.prevUSDT = tokenToStable + inventoryStable;
    this.pnl = this.prevUSDT - this.pnl;
  };

  getPnl = () => {
    return this.pnl;
  };
}
