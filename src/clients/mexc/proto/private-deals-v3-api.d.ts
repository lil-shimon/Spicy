export interface PrivateDealsV3Api {
  price?: string;
  quantity?: string;
  amount?: string;
  tradeType?: number;
  isMaker?: boolean;
  isSelfTrade?: boolean;
  tradeId?: string;
  clientOrderId?: string;
  orderId?: string;
  feeAmount?: string;
  feeCurrency?: string;
  time?: number;
}
