export interface PublicAggreDealsV3Api {
  deals?: PublicAggreDealsV3ApiItem[];
  eventType?: string;
}

export interface PublicAggreDealsV3ApiItem {
  price?: string;
  quantity?: string;
  tradeType?: number;
  time?: number;
}
