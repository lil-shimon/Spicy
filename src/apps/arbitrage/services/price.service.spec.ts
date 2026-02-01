import { PriceRepository } from '../repositories/price.repository';
import { describe, vi, it, expect, beforeEach } from 'vitest';
import { ArbitrageService } from './arbitrage.service';
import { ExchangeRateArbitrageService } from './exchange-rate-arbitrage.service';
import { PriceService } from './price.service';

vi.mock('../clients', async () => ({
  postMessage: vi.fn(),
}));

describe('PriceService', () => {
  let mockPriceRepository: ReturnType<typeof PriceRepository>;
  let mockArbitrageService: ReturnType<typeof ArbitrageService>;
  let mockExchangeRateArbitrageService: ReturnType<
    typeof ExchangeRateArbitrageService
  >;
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

    mockExchangeRateArbitrageService = {
      start: vi.fn(),
      checkArbitrage: vi.fn(),
      checkExchangeRateArbitrage: vi.fn(),
    };

    mockPriceService = PriceService({
      priceRepository: mockPriceRepository,
      arbitrageService: mockArbitrageService,
      exchangeRateArbitrageService: mockExchangeRateArbitrageService,
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

    it.todo(
      'should call arbitrageService checkTriangleArbitrage if price updated'
    );

    it.todo('should return true if priceRepository updatePrice returns true');
  });

  describe('handleClose', () => {
    it('should log and postMessage on WebSocket close', () => {
      const consoleSpy = vi.spyOn(console, 'log');

      const message = 'WebSocket closed';
      mockPriceService._handleClose(message);

      expect(consoleSpy).toHaveBeenCalledWith(
        'WebSocketの接続が閉じられました:',
        message
      );
    });

    it.todo('should postMessage on WebSocket close');
  });

  describe('handleError', () => {
    it('should log error and postMessage on WebSocket error', () => {
      const consoleSpy = vi.spyOn(console, 'error');

      const message = 'WebSocket error occurred';
      mockPriceService._handleError(message);

      expect(consoleSpy).toHaveBeenCalledWith('WebSocketエラー:', message);
    });

    it.todo('should postMessage on WebSocket error');
  });
});
