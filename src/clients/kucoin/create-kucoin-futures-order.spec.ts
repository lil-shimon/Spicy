import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createKucoinFuturesOrder } from './create-kucoin-futures-order';
import { kucoinFuturesClient } from './kucoin-client';
import type { Order } from 'ccxt';

// Mock modules
vi.mock('./kucoin-client', () => ({
  kucoinFuturesClient: {
    createOrder: vi.fn(),
  },
}));

vi.mock('../../utils/symbol-converter/symbol-converter', () => ({
  convertToFuturesSymbol: vi.fn((symbol: string) => {
    if (symbol === 'SOL/USDT') return 'SOLUSDTM';
    if (symbol === 'BTC/USDT') return 'XBTUSDTM';
    return symbol.replace('/', '') + 'M';
  }),
}));

describe('createKucoinFuturesOrder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a buy order successfully', async () => {
    const mockOrder = {
      id: 'order-123',
      symbol: 'SOLUSDTM',
      side: 'buy',
      type: 'limit',
      amount: 10,
      price: 100,
      status: 'open',
    };

    vi.mocked(kucoinFuturesClient.createOrder).mockResolvedValue(
      mockOrder as Order
    );

    const result = await createKucoinFuturesOrder(
      'SOL/USDT',
      'buy',
      10,
      100,
      2
    );

    expect(kucoinFuturesClient.createOrder).toHaveBeenCalledWith(
      'SOLUSDTM',
      'limit',
      'buy',
      10,
      100,
      { leverage: 2 }
    );
    expect(result).toEqual(mockOrder);
  });

  it('should create a sell order with default leverage', async () => {
    const mockOrder = {
      id: 'order-456',
      symbol: 'XBTUSDTM',
      side: 'sell',
      type: 'limit',
      amount: 5,
      price: 50000,
      status: 'open',
    };

    vi.mocked(kucoinFuturesClient.createOrder).mockResolvedValue(
      mockOrder as Order
    );

    const result = await createKucoinFuturesOrder('BTC/USDT', 'sell', 5, 50000);

    expect(kucoinFuturesClient.createOrder).toHaveBeenCalledWith(
      'XBTUSDTM',
      'limit',
      'sell',
      5,
      50000,
      { leverage: 1 }
    );
    expect(result).toEqual(mockOrder);
  });

  it('should handle order creation failure', async () => {
    const mockError = new Error('Insufficient balance');
    vi.mocked(kucoinFuturesClient.createOrder).mockRejectedValue(mockError);

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(
      createKucoinFuturesOrder('SOL/USDT', 'buy', 10, 100)
    ).rejects.toThrow('Insufficient balance');

    expect(consoleSpy).toHaveBeenCalledWith(
      'KuCoin futures order creation failed:',
      mockError
    );

    consoleSpy.mockRestore();
  });
});
