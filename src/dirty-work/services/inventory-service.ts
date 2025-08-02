import { fetchMexcBalance } from '../../clients';

export class InventoryService {
  public inventory: Record<string, number> = {};

  addInventory = (symbol: string, amount: number) => {
    this.inventory[symbol] = amount;
  };

  updateInventory = async (symbol: string) => {
    const balance = await fetchMexcBalance();
    const inventory = balance[symbol]?.total;
    this.addInventory(symbol, inventory ?? 0);
  };
}
