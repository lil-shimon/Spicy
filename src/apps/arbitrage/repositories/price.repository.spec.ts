import { describe, expect, it } from 'vitest';
import { PriceRepository } from './price.repository';

describe('PriceRepository', () => {
  describe('updatePrice', () => {
    describe('return value', () => {
      it('should return true when the first time', () => {
        const repository = PriceRepository();
        const result = repository.updatePrice('BTC', 'binance', 50000, 51000);
        expect(result).toBe(true);
      });

      it('should return true when price was changed', () => {
        const repository = PriceRepository();
        const result = repository.updatePrice('BTC', 'binance', 50000, 51000);
        expect(result).toBe(true);
        const update = repository.updatePrice('BTC', 'binance', 52000, 53000);
        expect(update).toBe(true);
      });

      it('should return true when bid is same', () => {
        const repository = PriceRepository();
        const result = repository.updatePrice('BTC', 'binance', 50000, 51000);
        expect(result).toBe(true);
        const update = repository.updatePrice('BTC', 'binance', 50000, 52000);
        expect(update).toBe(true);
      });

      it('should return true when ask is same', () => {
        const repository = PriceRepository();
        const result = repository.updatePrice('BTC', 'binance', 50000, 52000);
        expect(result).toBe(true);
        const update = repository.updatePrice('BTC', 'binance', 51000, 52000);
        expect(update).toBe(true);
      });

      it('should return false when price was not changed', () => {
        const repository = PriceRepository();
        const result = repository.updatePrice('BTC', 'binance', 50000, 51000);
        expect(result).toBe(true);
        const update = repository.updatePrice('BTC', 'binance', 50000, 51000);
        expect(update).toBe(false);
      });
    });
    it('should update price correctly', () => {
      const repository = PriceRepository();
      repository.updatePrice('BTC', 'binance', 50000, 51000);
      expect(repository.getPrice('BTC', 'binance')).toEqual({
        bid: 50000,
        ask: 51000,
      });

      repository.updatePrice('ETH', 'binance', 3000, 3100);
      expect(repository.getPrice('ETH', 'binance')).toEqual({
        bid: 3000,
        ask: 3100,
      });
      expect(repository.getPrice('BTC', 'binance')).toEqual({
        bid: 50000,
        ask: 51000,
      });
    });

    it('should return undefined for non-existent prices', () => {
      const repository = PriceRepository();
      expect(repository.getPrice('LTC', 'binance')).toBeUndefined();
    });
  });
});
