import { fetchMexcBalance } from '../../clients';

export type InventoryService = ReturnType<typeof createInventoryService>;

export const createInventoryService = () => {
  let inventory: Record<string, number> = {};

  return {
    addInventory: (symbol: string, amount: number) => {
      inventory = { ...inventory, [symbol]: amount };
    },

    updateInventory: async (symbol: string) => {
      const balance = await fetchMexcBalance();
      const inventoryAmount = balance[symbol]?.total;
      inventory = { ...inventory, [symbol]: inventoryAmount ?? 0 };
    },

    getInventory: (pair: string) => {
      const symbol = pair.split('/')[0];
      return inventory[symbol] ?? 0;
    },
  };
};
