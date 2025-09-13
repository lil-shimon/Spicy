import { PriceRepository } from '../repositories/price.repository';
import { describe, vi, it } from 'vitest';
import { ArbitrageService } from './arbitrage.service';
import { beforeEach } from 'node:test';
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
    it('should call priceRepository  updatePrice', () => {
      vi.mocked(mockPriceRepository.updatePrice).mockReturnValue(false);
    });
  });
});
