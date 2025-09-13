import { PriceRepository } from '../repositories/price.repository';
import { describe, vi } from 'vitest';
import { ArbitrageService } from './arbitrage.service';
import { beforeEach } from 'node:test';

describe('PriceService', () => {
  let mockPriceRepository: ReturnType<typeof PriceRepository>;
  let mockArbitrageService: ReturnType<typeof ArbitrageService>;

  beforeEach(() => {
    vi.clearAllMocks();
  });
});
