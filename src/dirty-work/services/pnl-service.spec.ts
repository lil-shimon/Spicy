import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PnLService } from './pnl-service';
import { InventoryService } from './inventory-service';

// Mock the InventoryService
vi.mock('./inventory-service', () => ({
  InventoryService: vi.fn(),
}));

describe('PnLService', () => {
  let pnlService: PnLService;
  let mockInventoryService: InventoryService;

  beforeEach(() => {
    mockInventoryService = {
      getInventory: vi.fn(),
    } as any;
    pnlService = new PnLService(mockInventoryService);
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with InventoryService dependency', () => {
      expect(pnlService).toBeInstanceOf(PnLService);
      expect(pnlService.getPnl()).toBe(0);
      expect(pnlService.getInitialUSDT()).toBe(0);
    });
  });

  describe('initialize', () => {
    it('should calculate and set initial USDT correctly', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      vi.mocked(mockInventoryService.getInventory)
        .mockReturnValueOnce(100) // stable balance
        .mockReturnValueOnce(2); // token balance

      pnlService.initialize(50000, 'BTC', 'USDT');

      expect(mockInventoryService.getInventory).toHaveBeenCalledWith('BTC');
      expect(mockInventoryService.getInventory).toHaveBeenCalledWith('USDT');
      expect(pnlService.getInitialUSDT()).toBe(100100); // 100 + (2 * 50000)
      expect(consoleSpy).toHaveBeenCalledWith('initialize', 100100);

      consoleSpy.mockRestore();
    });

    it('should handle zero balances', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      vi.mocked(mockInventoryService.getInventory)
        .mockReturnValueOnce(0) // stable balance
        .mockReturnValueOnce(0); // token balance

      pnlService.initialize(50000, 'BTC', 'USDT');

      expect(pnlService.getInitialUSDT()).toBe(0);
      expect(consoleSpy).toHaveBeenCalledWith('initialize', 0);

      consoleSpy.mockRestore();
    });

    it('should handle zero price', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      vi.mocked(mockInventoryService.getInventory)
        .mockReturnValueOnce(500) // stable balance
        .mockReturnValueOnce(1); // token balance

      pnlService.initialize(0, 'BTC', 'USDT');

      expect(pnlService.getInitialUSDT()).toBe(500); // 500 + (1 * 0)
      expect(consoleSpy).toHaveBeenCalledWith('initialize', 500);

      consoleSpy.mockRestore();
    });
  });

  describe('updateCurrentPrice', () => {
    it('should update current price', () => {
      // First, initialize with specific mocks for initialization
      vi.mocked(mockInventoryService.getInventory)
        .mockReturnValueOnce(1000) // stable balance for initialization
        .mockReturnValueOnce(1); // token balance for initialization

      pnlService.initialize(50000, 'BTC', 'USDT');

      // Then update price and test PnL calculation
      pnlService.updateCurrentPrice(60000);

      vi.mocked(mockInventoryService.getInventory)
        .mockReturnValueOnce(1) // token balance for updatePnl
        .mockReturnValueOnce(1000); // stable balance for updatePnl

      pnlService.updatePnl('BTC', 'USDT');

      expect(pnlService.getPnl()).toBe(10000); // (1 * 60000) + 1000 - 51000
    });

    it('should handle zero price update', () => {
      // First, initialize with specific mocks for initialization
      vi.mocked(mockInventoryService.getInventory)
        .mockReturnValueOnce(1000) // stable balance for initialization
        .mockReturnValueOnce(1); // token balance for initialization

      pnlService.initialize(50000, 'BTC', 'USDT');

      // Then update price and test PnL calculation
      pnlService.updateCurrentPrice(0);

      vi.mocked(mockInventoryService.getInventory)
        .mockReturnValueOnce(1) // token balance for updatePnl
        .mockReturnValueOnce(1000); // stable balance for updatePnl

      pnlService.updatePnl('BTC', 'USDT');

      expect(pnlService.getPnl()).toBe(-50000); // (1 * 0) + 1000 - 51000
    });

    it('should handle negative price update', () => {
      // First, initialize with specific mocks for initialization
      vi.mocked(mockInventoryService.getInventory)
        .mockReturnValueOnce(1000) // stable balance for initialization
        .mockReturnValueOnce(1); // token balance for initialization

      pnlService.initialize(50000, 'BTC', 'USDT');

      // Then update price and test PnL calculation
      pnlService.updateCurrentPrice(-1000);

      vi.mocked(mockInventoryService.getInventory)
        .mockReturnValueOnce(1) // token balance for updatePnl
        .mockReturnValueOnce(1000); // stable balance for updatePnl

      pnlService.updatePnl('BTC', 'USDT');

      expect(pnlService.getPnl()).toBe(-51000); // (1 * -1000) + 1000 - 51000
    });
  });

  describe('updatePnl', () => {
    beforeEach(() => {
      // Set up initial state
      vi.mocked(mockInventoryService.getInventory)
        .mockReturnValueOnce(1000) // stable balance for initialization
        .mockReturnValueOnce(1); // token balance for initialization
      pnlService.initialize(50000, 'BTC', 'USDT');
      pnlService.updateCurrentPrice(55000);
    });

    it('should calculate PnL correctly with profit', () => {
      vi.mocked(mockInventoryService.getInventory)
        .mockReturnValueOnce(1) // token balance
        .mockReturnValueOnce(1000); // stable balance

      pnlService.updatePnl('BTC', 'USDT');

      expect(pnlService.getPnl()).toBe(5000); // (1 * 55000) + 1000 - 51000
    });

    it('should calculate PnL correctly with loss', () => {
      pnlService.updateCurrentPrice(45000);
      vi.mocked(mockInventoryService.getInventory)
        .mockReturnValueOnce(1) // token balance
        .mockReturnValueOnce(1000); // stable balance

      pnlService.updatePnl('BTC', 'USDT');

      expect(pnlService.getPnl()).toBe(-5000); // (1 * 45000) + 1000 - 51000
    });

    it('should handle zero token balance', () => {
      vi.mocked(mockInventoryService.getInventory)
        .mockReturnValueOnce(0) // token balance
        .mockReturnValueOnce(1000); // stable balance

      pnlService.updatePnl('BTC/USDT', 'USDT/USDT');

      expect(pnlService.getPnl()).toBe(-50000); // (0 * 55000) + 1000 - 51000
    });

    it('should handle zero stable balance', () => {
      vi.mocked(mockInventoryService.getInventory)
        .mockReturnValueOnce(1) // token balance
        .mockReturnValueOnce(0); // stable balance

      pnlService.updatePnl('BTC', 'USDT');

      expect(pnlService.getPnl()).toBe(4000); // (1 * 55000) + 0 - 51000
    });

    it('should handle multiple updates correctly', () => {
      // First update
      vi.mocked(mockInventoryService.getInventory)
        .mockReturnValueOnce(1) // token balance
        .mockReturnValueOnce(1000); // stable balance
      pnlService.updatePnl('BTC', 'USDT');
      expect(pnlService.getPnl()).toBe(5000);

      // Second update with different price
      pnlService.updateCurrentPrice(60000);
      vi.mocked(mockInventoryService.getInventory)
        .mockReturnValueOnce(1.5) // token balance
        .mockReturnValueOnce(500); // stable balance
      pnlService.updatePnl('BTC', 'USDT');
      expect(pnlService.getPnl()).toBe(39500); // (1.5 * 60000) + 500 - 51000
    });
  });

  describe('getPnl', () => {
    it('should return initial PnL of 0', () => {
      expect(pnlService.getPnl()).toBe(0);
    });

    it('should return updated PnL after calculation', () => {
      vi.mocked(mockInventoryService.getInventory)
        .mockReturnValueOnce(1000) // stable balance for initialization
        .mockReturnValueOnce(2); // token balance for initialization
      pnlService.initialize(30000, 'ETH', 'USDT');
      pnlService.updateCurrentPrice(35000);

      vi.mocked(mockInventoryService.getInventory)
        .mockReturnValueOnce(2) // token balance
        .mockReturnValueOnce(1000); // stable balance
      pnlService.updatePnl('ETH', 'USDT');

      expect(pnlService.getPnl()).toBe(10000); // (2 * 35000) + 1000 - 61000
    });
  });

  describe('getInitialUSDT', () => {
    it('should return initial USDT of 0 before initialization', () => {
      expect(pnlService.getInitialUSDT()).toBe(0);
    });

    it('should return correct initial USDT after initialization', () => {
      vi.mocked(mockInventoryService.getInventory)
        .mockReturnValueOnce(2000) // stable balance
        .mockReturnValueOnce(0.5); // token balance

      pnlService.initialize(40000, 'BTC', 'USDT');

      expect(pnlService.getInitialUSDT()).toBe(22000); // 2000 + (0.5 * 40000)
    });
  });
});
