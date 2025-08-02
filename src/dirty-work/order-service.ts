import { Order } from 'ccxt';

export class OrderService {
  public ordered: boolean = false;
  public orders: Order[] = [];

  updateOrderStatus = (status: boolean) => {
    this.ordered = status;
  };

  addOrder = (orders: Order[]) => {
    this.orders.push(...orders);
    console.log('addOrder', this.orders.length);
  };

  removeOrder = (id: string) => {
    this.orders = this.orders.filter((o) => o.id !== id);
    console.log('removeOrder', this.orders.length);
  };
}
