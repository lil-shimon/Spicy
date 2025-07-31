import { describe, expect, it } from 'vitest';
import { handleStatus } from './status';
import { Order } from 'ccxt';

describe('handleStatus', () => {
  describe('isOpened', () => {
    it('should return true if any order is open', () => {
      const orders = [{ status: 'open' }, { status: 'closed' }] as Order[];
      const { isOpened } = handleStatus({ orders });
      expect(isOpened).toBe(true);
    });

    it('should return false if no order is open', () => {
      const orders = [{ status: 'closed' }, { status: 'closed' }] as Order[];
      const { isOpened } = handleStatus({ orders });
      expect(isOpened).toBe(false);
    });

    it('should return false if one order is open', () => {
      const orders = [{ status: 'open' }, { status: 'closed' }] as Order[];
      const { isOpened } = handleStatus({ orders });
      expect(isOpened).toBe(true);
    });
  });

  describe('isClosed', () => {
    it('should return true if all orders are closed', () => {
      const orders = [{ status: 'closed' }, { status: 'closed' }] as Order[];
      const { isClosed } = handleStatus({ orders });
      expect(isClosed).toBe(true);
    });

    it('should return false if one order is open', () => {
      const orders = [{ status: 'open' }, { status: 'closed' }] as Order[];
      const { isClosed } = handleStatus({ orders });
      expect(isClosed).toBe(false);
    });

    it('should return false if no order is open', () => {
      const orders = [{ status: 'closed' }, { status: 'closed' }] as Order[];
      const { isClosed } = handleStatus({ orders });
      expect(isClosed).toBe(true);
    });
  });
});
