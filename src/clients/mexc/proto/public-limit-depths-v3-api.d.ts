export interface PublicLimitDepthsV3Api {
  asks?: PublicLimitDepthV3ApiItem[];
  bids?: PublicLimitDepthV3ApiItem[];
  eventType?: string;
  version?: string;
}

export interface PublicLimitDepthV3ApiItem {
  price?: string;
  quantity?: string;
}
