import { vi, describe, beforeEach, it, expect } from 'vitest';
import { ArbitrageService } from './arbitrage.service';
import { PriceRepository } from '../repositories/price.repository';
import { calcTriangleArbitrage, Result } from '../domain/triangle';

vi.mock('../domain/triangle', async () => ({
  calcTriangleArbitrage: vi.fn(),
}));

const params = {
  pairs: ['BTC-USDT', 'DOGE-BTC', 'DOGE-USDT'],
};

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
    describe('ok: false cases', () => {
      it('should return ok: false when price data is missing', () => {
        vi.mocked(mockPriceRepository.getPrice).mockReturnValue(undefined);

        const result = mockArbitrageService.checkTriangleArbitrage(params);

        expect(result.ok).toBe(false);
      });

      it('should return ok: false when no arbitrage opportunity exists', () => {
        vi.mocked(calcTriangleArbitrage).mockReturnValue({
          ok: false,
        } as Result);
        vi.mocked(mockPriceRepository.getPrice).mockReturnValue({
          bid: 1,
          ask: 2,
        });

        const result = mockArbitrageService.checkTriangleArbitrage(params);

        expect(result.ok).toBe(false);
      });

      it('should return ok: false when symbols length is less than 3', () => {
        const result = mockArbitrageService.checkTriangleArbitrage({
          pairs: ['BTC-USDT', 'DOGE-BTC'],
        });

        expect(result.ok).toBe(false);
      });

      it('should return ok: false when symbols length is more than 3', () => {
        const result = mockArbitrageService.checkTriangleArbitrage({
          pairs: ['BTC-USDT', 'DOGE-BTC', 'DOGE-USDT', 'ETH-USDT'],
        });

        expect(result.ok).toBe(false);
      });
    });

    describe('ok: true cases', () => {
      beforeEach(() => {
        vi.mocked(calcTriangleArbitrage).mockReturnValue({
          ok: true,
        } as Result);
        vi.mocked(mockPriceRepository.getPrice).mockReturnValue({
          bid: 1,
          ask: 2,
        });
      });
      it('should return ok: true when arbitrage opportunity exists', () => {
        const result = mockArbitrageService.checkTriangleArbitrage(params);

        expect(result.ok).toBe(true);
      });
    });
  });
});
