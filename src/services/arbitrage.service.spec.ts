import { vi } from 'vitest';
import { ArbitrageService } from './arbitrage.service';

describe('ArbitrageService', () => {
  const mockPriceRepository = vi.fn();
  const arbitrageService = ArbitrageService({
    priceRepository: mockPriceRepository,
  });
});
