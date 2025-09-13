import { PriceRepository } from '../repositories/price.repository';
import { describe, vi, it } from 'vitest';
import { ArbitrageService } from './arbitrage.service';
import { beforeEach } from 'node:test';

describe('PriceService', () => {
  let mockPriceRepository: ReturnType<typeof PriceRepository>;
  let mockArbitrageService: ReturnType<typeof ArbitrageService>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockPriceRepository = {
      getPrice: vi.fn(),
      updatePrice: vi.fn(),
    };
  });

  describe('handleUpdate', () => {
    it('should call priceRepository  updatePrice', () => {
      vi.mocked(mockPriceRepository.updatePrice).mockReturnValue(false);
    });
  });
});
