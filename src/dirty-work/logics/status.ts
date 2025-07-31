import { Order } from 'ccxt';

type HandleStatusParams = {
  orders: Array<Order | undefined>;
};

export const handleStatus = ({ orders }: HandleStatusParams) => {
  const isOpened = orders.some((order) => order?.status === 'open');
  return { isOpened };
};
