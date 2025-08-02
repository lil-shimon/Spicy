import { fetchMexcBalance } from '../../clients';

export class InventoryService {
  private inventory: Record<string, number> = {};

  addInventory = (symbol: string, amount: number) => {
    this.inventory[symbol] = amount;
  };

  updateInventory = async (symbol: string) => {
    const balance = await fetchMexcBalance();
    const inventory = balance[symbol]?.total;
    this.addInventory(symbol, inventory ?? 0);
  };

  getInventory = (pair: string) => {
    const symbol = pair.split('/')[0];
    console.log('inventory', this.inventory[symbol], symbol);
    return this.inventory[symbol] ?? 0;
  };
}
