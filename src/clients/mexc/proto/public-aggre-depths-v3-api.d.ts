export interface PublicAggreDepthsV3Api {
  asks?: PublicAggreDepthV3ApiItem[];
  bids?: PublicAggreDepthV3ApiItem[];
  eventType?: string;
  fromVersion?: string;
  toVersion?: string;
}

export interface PublicAggreDepthV3ApiItem {
  price?: string;
  quantity?: string;
}
