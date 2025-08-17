export interface PublicIncreaseDepthsV3Api {
  asks?: PublicIncreaseDepthV3ApiItem[];
  bids?: PublicIncreaseDepthV3ApiItem[];
  eventType?: string;
  version?: string;
}

export interface PublicIncreaseDepthV3ApiItem {
  price?: string;
  quantity?: string;
}
