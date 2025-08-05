import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Balances } from 'ccxt';
import {
  createInventoryService,
  type InventoryService,
} from './inventory-service';
import { fetchMexcBalance } from '../../clients';

// Mock the fetchMexcBalance function
vi.mock('../../clients', () => ({
  fetchMexcBalance: vi.fn(),
}));

describe('InventoryService', () => {
  let inventoryService: InventoryService;
  const mockFetchMexcBalance = vi.mocked(fetchMexcBalance);

  beforeEach(() => {
    inventoryService = createInventoryService();
    vi.clearAllMocks();
  });

  describe('addInventory', () => {
    it('should add inventory for a symbol', () => {
      inventoryService.addInventory('BTC', 1.5);
      expect(inventoryService.getInventory('BTC/USDT')).toBe(1.5);
    });

    it('should update existing inventory for a symbol', () => {
      inventoryService.addInventory('ETH', 10);
      inventoryService.addInventory('ETH', 5);
      expect(inventoryService.getInventory('ETH/USDT')).toBe(5);
    });

    it('should handle zero amount', () => {
      inventoryService.addInventory('BTC', 0);
      expect(inventoryService.getInventory('BTC/USDT')).toBe(0);
    });

    it('should handle negative amount', () => {
      inventoryService.addInventory('LTC', -1);
      expect(inventoryService.getInventory('LTC/USDT')).toBe(-1);
    });
  });

  describe('updateInventory', () => {
    it('should update inventory from MEXC balance', async () => {
      const mockBalance = {
        BTC: { total: 2.5, free: 2.5, used: 0 },
        ETH: { total: 15.0, free: 15.0, used: 0 },
      } as unknown as Balances;
      mockFetchMexcBalance.mockResolvedValue(mockBalance);

      await inventoryService.updateInventory('BTC');

      expect(mockFetchMexcBalance).toHaveBeenCalledTimes(1);
      expect(inventoryService.getInventory('BTC/USDT')).toBe(2.5);
    });

    it('should handle symbol not found in balance', async () => {
      const mockBalance = {
        ETH: { total: 15.0, free: 15.0, used: 0 },
      } as unknown as Balances;
      mockFetchMexcBalance.mockResolvedValue(mockBalance);

      await inventoryService.updateInventory('BTC');

      expect(inventoryService.getInventory('BTC/USDT')).toBe(0);
    });

    it('should handle symbol with undefined total', async () => {
      const mockBalance: Balances = {
        BTC: { total: undefined },
      } as unknown as Balances;
      mockFetchMexcBalance.mockResolvedValue(mockBalance);

      await inventoryService.updateInventory('BTC');

      expect(inventoryService.getInventory('BTC/USDT')).toBe(0);
    });

    it('should handle fetchMexcBalance error', async () => {
      mockFetchMexcBalance.mockRejectedValue(new Error('API Error'));

      await expect(inventoryService.updateInventory('BTC')).rejects.toThrow(
        'API Error'
      );
    });

    it('should handle empty balance response', async () => {
      mockFetchMexcBalance.mockResolvedValue({} as Balances);

      await inventoryService.updateInventory('BTC');

      expect(inventoryService.getInventory('BTC/USDT')).toBe(0);
    });
  });

  describe('getInventory', () => {
    it('should return correct inventory for trading pair', () => {
      inventoryService.addInventory('BTC', 1.5);
      expect(inventoryService.getInventory('BTC/USDT')).toBe(1.5);
    });

    it('should extract symbol from trading pair correctly', () => {
      inventoryService.addInventory('ETH', 10);
      expect(inventoryService.getInventory('ETH/BTC')).toBe(10);
      expect(inventoryService.getInventory('ETH/USDT')).toBe(10);
    });

    it('should return 0 for non-existent symbol', () => {
      expect(inventoryService.getInventory('NONEXISTENT/USDT')).toBe(0);
    });

    it('should handle complex trading pair symbols', () => {
      inventoryService.addInventory('DOGE', 1000);
      expect(inventoryService.getInventory('DOGE/USDT')).toBe(1000);
    });

    it('should return 0 for empty trading pair', () => {
      expect(inventoryService.getInventory('/')).toBe(0);
    });

    it('should handle trading pair without slash', () => {
      inventoryService.addInventory('BTC', 5);
      expect(inventoryService.getInventory('BTC')).toBe(5);
    });
  });
});
