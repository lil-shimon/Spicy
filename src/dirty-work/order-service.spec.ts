import { describe, it, expect, beforeEach } from 'vitest';
import { Order } from 'ccxt';
import { OrderService } from './services/order-service';

describe('OrderService', () => {
  let orderService: OrderService;

  beforeEach(() => {
    orderService = new OrderService();
  });

  describe('updateOrderStatus', () => {
    it('should update ordered status to true', () => {
      orderService.updateOrderStatus(true);
      expect(orderService.ordered).toBe(true);
    });

    it('should update ordered status to false', () => {
      orderService.updateOrderStatus(false);
      expect(orderService.ordered).toBe(false);
    });
  });

  describe('addOrder', () => {
    it('should add orders to the orders array', () => {
      const mockOrders = [
        { id: 'order1', symbol: 'BTC/USDT' },
        { id: 'order2', symbol: 'ETH/USDT' },
      ] as Order[];

      orderService.addOrder(mockOrders);

      expect(orderService.orders.length).toBe(2);
      expect(orderService.orders).toEqual(mockOrders);
    });

    it('should append to existing orders', () => {
      const firstOrder = { id: 'order1' } as Order;
      const secondOrder = { id: 'order2' } as Order;

      orderService.addOrder([firstOrder]);
      orderService.addOrder([secondOrder]);

      expect(orderService.orders.length).toBe(2);
      expect(orderService.orders[0]).toEqual(firstOrder);
      expect(orderService.orders[1]).toEqual(secondOrder);
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

      expect(orderService.orders.length).toBe(2);
      expect(
        orderService.orders.find((o) => o.id === 'order2')
      ).toBeUndefined();
    });

    it('should handle non-existent order id', () => {
      const mockOrder = { id: 'order1' } as Order;
      orderService.addOrder([mockOrder]);

      orderService.removeOrder('non-existent');

      expect(orderService.orders.length).toBe(1);
    });
  });
});
