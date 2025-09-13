import { PriceRepository } from '../repositories/price.repository';
import { describe, vi, it, expect, beforeEach } from 'vitest';
import { ArbitrageService } from './arbitrage.service';
import { PriceService } from './price.service';

describe('PriceService', () => {
  let mockPriceRepository: ReturnType<typeof PriceRepository>;
  let mockArbitrageService: ReturnType<typeof ArbitrageService>;
  let mockPriceService: ReturnType<typeof PriceService>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockPriceRepository = {
      getPrice: vi.fn(),
      updatePrice: vi.fn(),
    };

    mockArbitrageService = {
      checkTriangleArbitrage: vi.fn(),
    };

    mockPriceService = PriceService({
      priceRepository: mockPriceRepository,
      arbitrageService: mockArbitrageService,
    });
  });

  describe('handleUpdate', () => {
    it('should call priceRepository updatePrice', () => {
      const params = {
        symbol: 'BTC-USDT',
        exchange: 'kucoin',
        ask: 30000,
        bid: 29900,
      };

      vi.mocked(mockPriceRepository.updatePrice).mockReturnValue(false);

      mockPriceService._handleUpdate(params);

      expect(mockPriceRepository.updatePrice).toHaveBeenCalledWith(
        params.symbol,
        params.exchange,
        params.bid,
        params.ask
      );
    });

    it('should return false if priceRepository updatePrice returns false', () => {
      const params = {
        symbol: 'BTC-USDT',
        exchange: 'kucoin',
        ask: 30000,
        bid: 29900,
      };

      vi.mocked(mockPriceRepository.updatePrice).mockReturnValue(false);

      const result = mockPriceService._handleUpdate(params);

      expect(result).toBe(false);
    });
  });
});
