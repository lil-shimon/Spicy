import { beforeEach, describe, it, vi, expect } from 'vitest';
import { createOrders } from './order';
import { createBybitOrder, createMexcOrder } from '../../clients';
import { EXCHANGES, PAIRS } from '../../constants';
import { FetchPriceResult } from '../fetch-price/fetch-price';

vi.mock('../../clients', () => ({
  createBybitOrder: vi.fn(),
  createMexcOrder: vi.fn(),
}));

describe('createOrders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('正常系', () => {
    it('PUMP_USDTペアでBybit→MEXC注文が正常に作成される', async () => {
      const mockBybitResult = { orderId: 'bybit123', status: 'filled' };
      const mockMexcResult = { orderId: 'mexc456', status: 'filled' };

      (createBybitOrder as any).mockResolvedValue(mockBybitResult);
      (createMexcOrder as any).mockResolvedValue(mockMexcResult);

      const data: FetchPriceResult[] = [
        {
          pair: PAIRS.PUMP_USDT,
          from: EXCHANGES.BYBIT,
          to: EXCHANGES.MEXC,
          expectedBuyPrice: 100,
          expectedSellPrice: 101,
          profit: 0.01,
        },
      ];

      const result = await createOrders(data);

      expect(createBybitOrder).toHaveBeenCalledWith(
        PAIRS.PUMP_USDT,
        'buy',
        250
      );
      expect(createMexcOrder).toHaveBeenCalledWith(
        PAIRS.PUMP_USDT,
        'sell',
        250
      );
      expect(result.successCount).toBe(2);
      expect(result.failCount).toBe(0);
      expect(result.results).toHaveLength(2);
    });

    it('PUMP_USDTペアでMEXC→Bybit注文が正常に作成される', async () => {
      const mockMexcResult = { orderId: 'mexc123', status: 'filled' };
      const mockBybitResult = { orderId: 'bybit456', status: 'filled' };

      (createMexcOrder as any).mockResolvedValue(mockMexcResult);
      (createBybitOrder as any).mockResolvedValue(mockBybitResult);

      const data: FetchPriceResult[] = [
        {
          pair: PAIRS.PUMP_USDT,
          from: EXCHANGES.MEXC,
          to: EXCHANGES.BYBIT,
          expectedBuyPrice: 100,
          expectedSellPrice: 101,
          profit: 0.01,
        },
      ];

      const result = await createOrders(data);

      expect(createMexcOrder).toHaveBeenCalledWith(PAIRS.PUMP_USDT, 'buy', 250);
      expect(createBybitOrder).toHaveBeenCalledWith(
        PAIRS.PUMP_USDT,
        'sell',
        250
      );
      expect(result.successCount).toBe(2);
      expect(result.failCount).toBe(0);
    });

    it('複数のFetchPriceResultで正しく注文が作成される', async () => {
      (createBybitOrder as any).mockResolvedValue({ orderId: 'bybit123' });
      (createMexcOrder as any).mockResolvedValue({ orderId: 'mexc123' });

      const data: FetchPriceResult[] = [
        {
          pair: PAIRS.PUMP_USDT,
          from: EXCHANGES.BYBIT,
          to: EXCHANGES.MEXC,
          expectedBuyPrice: 100,
          expectedSellPrice: 101,
          profit: 0.01,
        },
        {
          pair: PAIRS.PUMP_USDT,
          from: EXCHANGES.MEXC,
          to: EXCHANGES.BYBIT,
          expectedBuyPrice: 102,
          expectedSellPrice: 103,
          profit: 0.01,
        },
      ];

      const result = await createOrders(data);

      expect(createBybitOrder).toHaveBeenCalledTimes(2);
      expect(createMexcOrder).toHaveBeenCalledTimes(2);
      expect(result.successCount).toBe(4);
      expect(result.failCount).toBe(0);
    });
  });

  describe('異常系', () => {
    it('createBybitOrderが失敗した場合のエラーハンドリング', async () => {
      const error = new Error('Bybit API error');
      (createBybitOrder as any).mockRejectedValue(error);
      (createMexcOrder as any).mockResolvedValue({ orderId: 'mexc123' });

      const data: FetchPriceResult[] = [
        {
          pair: PAIRS.PUMP_USDT,
          from: EXCHANGES.BYBIT,
          to: EXCHANGES.MEXC,
          expectedBuyPrice: 100,
          expectedSellPrice: 101,
          profit: 0.01,
        },
        {
          pair: PAIRS.PUMP_USDT,
          from: EXCHANGES.BYBIT,
          to: EXCHANGES.MEXC,
          expectedBuyPrice: 102,
          expectedSellPrice: 103,
          profit: 0.01,
        },
      ];

      const result = await createOrders(data);

      expect(result.successCount).toBe(1);
      expect(result.failCount).toBe(1);
      expect(result.results).toHaveLength(2);

      const failedResult = result.results.find((r) => r.status === 'rejected');
      expect(failedResult).toBeDefined();
      expect((failedResult as any).reason).toBe(error);
    });

    it('createMexcOrderが失敗した場合のエラーハンドリング', async () => {
      const error = new Error('MEXC API error');
      (createBybitOrder as any).mockResolvedValue({ orderId: 'bybit123' });
      (createMexcOrder as any).mockRejectedValue(error);

      const data: FetchPriceResult[] = [
        {
          pair: PAIRS.PUMP_USDT,
          from: EXCHANGES.BYBIT,
          to: EXCHANGES.MEXC,
          expectedBuyPrice: 100,
          expectedSellPrice: 101,
          profit: 0.01,
        },
        {
          pair: PAIRS.PUMP_USDT,
          from: EXCHANGES.BYBIT,
          to: EXCHANGES.MEXC,
          expectedBuyPrice: 102,
          expectedSellPrice: 103,
          profit: 0.01,
        },
      ];

      const result = await createOrders(data);

      expect(result.successCount).toBe(1);
      expect(result.failCount).toBe(1);
    });

    it('一部の注文が成功・一部が失敗した場合の結果カウント', async () => {
      (createBybitOrder as any).mockResolvedValueOnce({ orderId: 'bybit123' });
      (createBybitOrder as any).mockRejectedValueOnce(new Error('Bybit error'));
      (createMexcOrder as any).mockResolvedValue({ orderId: 'mexc123' });

      const data: FetchPriceResult[] = [
        {
          pair: PAIRS.PUMP_USDT,
          from: EXCHANGES.BYBIT,
          to: EXCHANGES.MEXC,
          expectedBuyPrice: 100,
          expectedSellPrice: 101,
          profit: 0.01,
        },
        {
          pair: PAIRS.PUMP_USDT,
          from: EXCHANGES.BYBIT,
          to: EXCHANGES.MEXC,
          expectedBuyPrice: 102,
          expectedSellPrice: 103,
          profit: 0.01,
        },
      ];

      const result = await createOrders(data);

      expect(result.successCount).toBe(3);
      expect(result.failCount).toBe(1);
      expect(result.results).toHaveLength(4);
    });
  });

  describe('エッジケース', () => {
    it('PUMP_USDT以外のペアでは注文が作成されない', async () => {
      const data: FetchPriceResult[] = [
        {
          pair: PAIRS.SOL_USDT,
          from: EXCHANGES.BYBIT,
          to: EXCHANGES.MEXC,
          expectedBuyPrice: 100,
          expectedSellPrice: 101,
          profit: 0.01,
        },
        {
          pair: PAIRS.SOL_USDT,
          from: EXCHANGES.BYBIT,
          to: EXCHANGES.MEXC,
          expectedBuyPrice: 102,
          expectedSellPrice: 103,
          profit: 0.01,
        },
      ];

      const result = await createOrders(data);

      expect(createBybitOrder).not.toHaveBeenCalled();
      expect(createMexcOrder).not.toHaveBeenCalled();
      expect(result.successCount).toBe(0);
      expect(result.failCount).toBe(0);
      expect(result.results).toHaveLength(0);
    });

    it('空の配列が渡された場合', async () => {
      const data: FetchPriceResult[] = [];

      const result = await createOrders(data);

      expect(createBybitOrder).not.toHaveBeenCalled();
      expect(createMexcOrder).not.toHaveBeenCalled();
      expect(result.successCount).toBe(0);
      expect(result.failCount).toBe(0);
      expect(result.results).toHaveLength(0);
    });

    it('コンソールログが正しく出力される', async () => {
      (createBybitOrder as any).mockResolvedValue({ orderId: 'bybit123' });
      (createMexcOrder as any).mockResolvedValue({ orderId: 'mexc123' });

      const data: FetchPriceResult[] = [
        {
          pair: PAIRS.PUMP_USDT,
          from: EXCHANGES.BYBIT,
          to: EXCHANGES.MEXC,
          expectedBuyPrice: 100,
          expectedSellPrice: 101,
          profit: 0.01,
        },
        {
          pair: PAIRS.SOL_USDT,
          from: EXCHANGES.BYBIT,
          to: EXCHANGES.MEXC,
          expectedBuyPrice: 102,
          expectedSellPrice: 103,
          profit: 0.01,
        },
      ];

      await createOrders(data);

      expect(console.log).toHaveBeenCalledWith(
        'Bybitで買い注文を作成します PUMP/USDT '
      );
      expect(console.log).toHaveBeenCalledWith(
        'MEXCで売り注文を作成します PUMP/USDT '
      );
    });
  });
});
