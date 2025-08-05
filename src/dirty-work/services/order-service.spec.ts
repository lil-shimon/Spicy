import { describe, it, expect, beforeEach } from 'vitest';
import { Order } from 'ccxt';
import { createOrderService } from './order-service';

describe('createOrderService', () => {
  let orderService: ReturnType<typeof createOrderService>;

  beforeEach(() => {
    orderService = createOrderService();
  });

  describe('updateOrderStatus', () => {
    it('should update ordered status to true', () => {
      orderService.updateOrderStatus(true);
      expect(orderService.getOrdered()).toBe(true);
    });

    it('should update ordered status to false', () => {
      orderService.updateOrderStatus(false);
      expect(orderService.getOrdered()).toBe(false);
    });
  });

  describe('addOrder', () => {
    it('should add orders to the orders array', () => {
      const mockOrders = [
        { id: 'order1', symbol: 'BTC/USDT' },
        { id: 'order2', symbol: 'ETH/USDT' },
      ] as Order[];

      orderService.addOrder(mockOrders);

      expect(orderService.getOrders().length).toBe(2);
      expect(orderService.getOrders()).toEqual(mockOrders);
    });

    it('should append to existing orders', () => {
      const firstOrder = { id: 'order1' } as Order;
      const secondOrder = { id: 'order2' } as Order;

      orderService.addOrder([firstOrder]);
      orderService.addOrder([secondOrder]);

      expect(orderService.getOrders().length).toBe(2);
      expect(orderService.getOrders()[0]).toEqual(firstOrder);
      expect(orderService.getOrders()[1]).toEqual(secondOrder);
    });
  });

  describe('removeOrder', () => {
    it('should remove order by id', () => {
      const mockOrders = [
        { id: 'order1' },
        { id: 'order2' },
        { id: 'order3' },
      ] as Order[];
      orderService.addOrder(mockOrders);

      orderService.removeOrder('order2');

      expect(orderService.getOrders().length).toBe(2);
      expect(
        orderService.getOrders().find((o) => o.id === 'order2')
      ).toBeUndefined();
    });

    it('should handle non-existent order id', () => {
      const mockOrder = { id: 'order1' } as Order;
      orderService.addOrder([mockOrder]);

      orderService.removeOrder('non-existent');

      expect(orderService.getOrders().length).toBe(1);
    });
  });

  describe('getOrderIdBySide', () => {
    it('should return order id by side', () => {
      const mockOrders = [
        { id: 'order1', side: 'buy' },
        { id: 'order2', side: 'sell' },
      ] as Order[];
      orderService.addOrder(mockOrders);

      expect(orderService.getOrderIdBySide('buy')).toBe('order1');
      expect(orderService.getOrderIdBySide('sell')).toBe('order2');
    });

    it('should return undefined when no order with specified side exists', () => {
      const mockOrder = { id: 'order1', side: 'buy' } as Order;
      orderService.addOrder([mockOrder]);

      expect(orderService.getOrderIdBySide('sell')).toBeUndefined();
    });
  });
});
