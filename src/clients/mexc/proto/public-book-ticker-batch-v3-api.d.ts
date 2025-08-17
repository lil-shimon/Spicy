import { PublicBookTickerV3Api } from './PublicBookTickerV3Api';

export interface PublicBookTickerBatchV3Api {
  items?: PublicBookTickerV3Api[];
}

export interface PublicBookTickerV3Api {
  bidPrice?: string;
  bidQuantity?: string;
  askPrice?: string;
  askQuantity?: string;
}
