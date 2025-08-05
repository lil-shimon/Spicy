import { Order } from 'ccxt';

type OrderState = {
  ordered: boolean;
  orders: Order[];
};

export const createOrderService = () => {
  let state: OrderState = {
    ordered: false,
    orders: [],
  };

  const updateOrderStatus = (status: boolean) => {
    state = { ...state, ordered: status };
  };

  const addOrder = (orders: Order[]) => {
    state = { ...state, orders: [...state.orders, ...orders] };
    console.log('addOrder', state.orders.length);
  };

  const removeOrder = (id: string) => {
    state = { ...state, orders: state.orders.filter((o) => o.id !== id) };
    console.log('removeOrder', state.orders.length);
  };

  const getOrderIdBySide = (side: 'buy' | 'sell') => {
    const order = state.orders.find((o) => o.side === side);
    return order?.id;
  };

  return {
    updateOrderStatus,
    addOrder,
    removeOrder,
    getOrderIdBySide,
    // ゲッター関数を追加（テストやデバッグ用）
    getOrdered: () => state.ordered,
    getOrders: () => state.orders,
  };
};

// 後方互換性のため、classのインターフェースも一時的に保持
export class OrderService {
  private service = createOrderService();

  get ordered() {
    return this.service.getOrdered();
  }

  get orders() {
    return this.service.getOrders();
  }

  updateOrderStatus = this.service.updateOrderStatus;
  addOrder = this.service.addOrder;
  removeOrder = this.service.removeOrder;
  getOrderIdBySide = this.service.getOrderIdBySide;
}
