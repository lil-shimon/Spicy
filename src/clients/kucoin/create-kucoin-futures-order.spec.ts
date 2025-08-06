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
      'KuCoin先物注文の作成に失敗しました:',
      mockError
    );

    consoleSpy.mockRestore();
  });

  describe('パラメータバリデーション', () => {
    it('注文量が0の場合エラーをスローする', async () => {
      await expect(
        createKucoinFuturesOrder('SOL/USDT', 'buy', 0, 100)
      ).rejects.toThrow('注文量は0より大きい値である必要があります');

      expect(kucoinFuturesClient.createOrder).not.toHaveBeenCalled();
    });

    it('注文量が負の値の場合エラーをスローする', async () => {
      await expect(
        createKucoinFuturesOrder('SOL/USDT', 'buy', -10, 100)
      ).rejects.toThrow('注文量は0より大きい値である必要があります');

      expect(kucoinFuturesClient.createOrder).not.toHaveBeenCalled();
    });

    it('価格が0の場合エラーをスローする', async () => {
      await expect(
        createKucoinFuturesOrder('SOL/USDT', 'buy', 10, 0)
      ).rejects.toThrow('価格は0より大きい値である必要があります');

      expect(kucoinFuturesClient.createOrder).not.toHaveBeenCalled();
    });

    it('価格が負の値の場合エラーをスローする', async () => {
      await expect(
        createKucoinFuturesOrder('SOL/USDT', 'buy', 10, -100)
      ).rejects.toThrow('価格は0より大きい値である必要があります');

      expect(kucoinFuturesClient.createOrder).not.toHaveBeenCalled();
    });

    it('レバレッジが1未満の場合エラーをスローする', async () => {
      await expect(
        createKucoinFuturesOrder('SOL/USDT', 'buy', 10, 100, 0)
      ).rejects.toThrow('レバレッジは1から20の間である必要があります');

      expect(kucoinFuturesClient.createOrder).not.toHaveBeenCalled();
    });

    it('レバレッジが20を超える場合エラーをスローする', async () => {
      await expect(
        createKucoinFuturesOrder('SOL/USDT', 'buy', 10, 100, 21)
      ).rejects.toThrow('レバレッジは1から20の間である必要があります');

      expect(kucoinFuturesClient.createOrder).not.toHaveBeenCalled();
    });

    it('境界値テスト：レバレッジ1は有効', async () => {
      const mockOrder = {
        id: 'order-789',
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

      await expect(
        createKucoinFuturesOrder('SOL/USDT', 'buy', 10, 100, 1)
      ).resolves.toEqual(mockOrder);

      expect(kucoinFuturesClient.createOrder).toHaveBeenCalledWith(
        'SOLUSDTM',
        'limit',
        'buy',
        10,
        100,
        { leverage: 1 }
      );
    });

    it('境界値テスト：レバレッジ20は有効', async () => {
      const mockOrder = {
        id: 'order-999',
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

      await expect(
        createKucoinFuturesOrder('SOL/USDT', 'buy', 10, 100, 20)
      ).resolves.toEqual(mockOrder);

      expect(kucoinFuturesClient.createOrder).toHaveBeenCalledWith(
        'SOLUSDTM',
        'limit',
        'buy',
        10,
        100,
        { leverage: 20 }
      );
    });
  });
});
