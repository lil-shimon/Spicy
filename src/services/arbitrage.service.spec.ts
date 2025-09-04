import { vi, describe, beforeEach, it, expect } from 'vitest';
import { ArbitrageService } from './arbitrage.service';
import { PriceRepository } from '../repositories/price.repository';

vi.mock('../domain/triangle', async () => ({
  calcTriangleArbitrage: vi.fn(),
}));

describe('ArbitrageService', () => {
  let mockPriceRepository: ReturnType<typeof PriceRepository>;
  let mockArbitrageService: ReturnType<typeof ArbitrageService>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockPriceRepository = {
      getPrice: vi.fn(),
      updatePrice: vi.fn(),
    };

    mockArbitrageService = ArbitrageService({
      priceRepository: mockPriceRepository,
    });
  });

  describe('checkTriangleArbitrage', () => {
    it('should return ok: false when price data is missing', () => {
      vi.mocked(mockPriceRepository.getPrice).mockReturnValue(undefined);

      const result = mockArbitrageService.checkTriangleArbitrage();

      expect(result.ok).toBe(false);
    });
  });
});
