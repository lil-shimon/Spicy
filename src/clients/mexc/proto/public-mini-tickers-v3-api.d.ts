import { PublicMiniTickerV3Api } from './PublicMiniTickerV3Api';

export interface PublicMiniTickersV3Api {
  items?: PublicMiniTickerV3Api[];
}

export interface PublicMiniTickerV3Api {
  symbol?: string;
  price?: string;
  rate?: string;
  zonedRate?: string;
  high?: string;
  low?: string;
  volume?: string;
  quantity?: string;
  lastCloseRate?: string;
  lastCloseZonedRate?: string;
  lastCloseHigh?: string;
  lastCloseLow?: string;
}
