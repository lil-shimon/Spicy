export class OrderService {
  public ordered: boolean = false;

  updateOrderStatus = (status: boolean) => {
    this.ordered = status;
  };
}
