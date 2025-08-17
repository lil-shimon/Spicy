import { PublicIncreaseDepthsV3Api } from './PublicIncreaseDepthsV3Api';

export interface PublicIncreaseDepthsBatchV3Api {
  items?: PublicIncreaseDepthsV3Api[];
  eventType?: string;
}

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
