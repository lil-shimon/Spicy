import { Order } from 'ccxt';

export const createOrderService = () => {
  let ordered = false;
  let orders: Order[] = [];

  return {
    updateOrderStatus: (status: boolean) => {
      ordered = status;
    },

    addOrder: (newOrders: Order[]) => {
      orders = [...orders, ...newOrders];
      console.log('addOrder', orders.length);
    },

    removeOrder: (id: string) => {
      orders = orders.filter((o) => o.id !== id);
      console.log('removeOrder', orders.length);
    },

    getOrderIdBySide: (side: 'buy' | 'sell') => {
      const order = orders.find((o) => o.side === side);
      return order?.id;
    },

    getOrdered: () => ordered,
    getOrders: () => orders,
  };
};
