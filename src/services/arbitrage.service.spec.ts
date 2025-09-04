import { vi, describe, beforeEach } from 'vitest';
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
});
