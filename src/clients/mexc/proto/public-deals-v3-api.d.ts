export interface PublicDealsV3Api {
  deals?: PublicDealsV3ApiItem[];
  eventType?: string;
}

export interface PublicDealsV3ApiItem {
  price?: string;
  quantity?: string;
  tradeType?: number;
  time?: number;
}
