import { vi, describe, beforeEach, it, expect } from 'vitest';
import { ArbitrageService } from './arbitrage.service';
import { PriceRepository } from '../repositories/price.repository';
import { calcTriangleArbitrage } from '../domain/triangle/calc-triangle-arbitrage';
import type { Result } from '../domain/triangle/types';

vi.mock('../domain/triangle/calc-triangle-arbitrage', async () => ({
  calcTriangleArbitrage: vi.fn(),
}));

const params = {
  triangle: ['BTC-USDT', 'DOGE-BTC', 'DOGE-USDT'],
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
          triangle: ['BTC-USDT', 'DOGE-BTC'],
        });

        expect(result.ok).toBe(false);
      });

      it('should return ok: false when symbols length is more than 3', () => {
        const result = mockArbitrageService.checkTriangleArbitrage({
          triangle: ['BTC-USDT', 'DOGE-BTC', 'DOGE-USDT', 'ETH-USDT'],
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

      it('should call calcTriangleArbitrage with correct parameters', () => {
        mockArbitrageService.checkTriangleArbitrage(params);

        expect(calcTriangleArbitrage).toHaveBeenCalledWith({
          buyBtcPair: { bid: 1, ask: 2 },
          buyTokenPair: { bid: 1, ask: 2 },
          buyStablePair: { bid: 1, ask: 2 },
          takerFee: 0.001,
        });
      });

      it('should call getPrice three times', () => {
        mockArbitrageService.checkTriangleArbitrage(params);

        expect(mockPriceRepository.getPrice).toHaveBeenCalledTimes(3);
      });

      it('should return price information correctly', () => {
        vi.mocked(calcTriangleArbitrage).mockReturnValue({
          ok: true,
          usdtIn: 1,
          usdtOut: 1.01,
          roi: 0.01,
          detail: {
            baseAsk: 1,
            midAsk: 2,
            outBid: 3,
            takerFee: 0.001,
            epsilon: 0.001,
          },
        } as Result);

        const result = mockArbitrageService.checkTriangleArbitrage(params);

        expect(result).toEqual({
          ok: true,
          usdtIn: 1,
          usdtOut: 1.01,
          roi: 0.01,
          detail: {
            baseAsk: 1,
            midAsk: 2,
            outBid: 3,
            takerFee: 0.001,
            epsilon: 0.001,
          },
        });
      });
    });
  });
});
