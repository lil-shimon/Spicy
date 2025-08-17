export interface PrivateOrdersV3Api {
  id?: string;
  clientId?: string;
  price?: string;
  quantity?: string;
  amount?: string;
  avgPrice?: string;
  orderType?: number;
  tradeType?: number;
  isMaker?: boolean;
  remainAmount?: string;
  remainQuantity?: string;
  lastDealQuantity?: string;
  cumulativeQuantity?: string;
  cumulativeAmount?: string;
  status?: number;
  createTime?: number;
  market?: string;
  triggerType?: number;
  triggerPrice?: string;
  state?: number;
  ocoId?: string;
  routeFactor?: string;
  symbolId?: string;
  marketId?: string;
  marketCurrencyId?: string;
  currencyId?: string;
}
