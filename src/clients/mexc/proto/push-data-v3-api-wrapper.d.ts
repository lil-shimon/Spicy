import { PublicDealsV3Api } from './PublicDealsV3Api';
import { PublicIncreaseDepthsV3Api } from './PublicIncreaseDepthsV3Api';
import { PublicLimitDepthsV3Api } from './PublicLimitDepthsV3Api';
import { PrivateOrdersV3Api } from './PrivateOrdersV3Api';
import { PublicBookTickerV3Api } from './PublicBookTickerV3Api';
import { PrivateDealsV3Api } from './PrivateDealsV3Api';
import { PrivateAccountV3Api } from './PrivateAccountV3Api';
import { PublicSpotKlineV3Api } from './PublicSpotKlineV3Api';
import { PublicMiniTickerV3Api } from './PublicMiniTickerV3Api';
import { PublicMiniTickersV3Api } from './PublicMiniTickersV3Api';
import { PublicBookTickerBatchV3Api } from './PublicBookTickerBatchV3Api';
import { PublicIncreaseDepthsBatchV3Api } from './PublicIncreaseDepthsBatchV3Api';
import { PublicAggreDepthsV3Api } from './PublicAggreDepthsV3Api';
import { PublicAggreDealsV3Api } from './PublicAggreDealsV3Api';
import { PublicAggreBookTickerV3Api } from './PublicAggreBookTickerV3Api';

import { PublicMiniTickerV3Api } from './PublicMiniTickerV3Api';

import { PublicBookTickerV3Api } from './PublicBookTickerV3Api';

import { PublicIncreaseDepthsV3Api } from './PublicIncreaseDepthsV3Api';

export interface PushDataV3ApiWrapper {
  //频道
  channel?: string;
  //交易对
  symbol?: string;
  //交易对ID
  symbolId?: string;
  //消息生成时间
  createTime?: number;
  //消息推送时间
  sendTime?: number;
  publicDeals?: PublicDealsV3Api;
  publicIncreaseDepths?: PublicIncreaseDepthsV3Api;
  publicLimitDepths?: PublicLimitDepthsV3Api;
  privateOrders?: PrivateOrdersV3Api;
  publicBookTicker?: PublicBookTickerV3Api;
  privateDeals?: PrivateDealsV3Api;
  privateAccount?: PrivateAccountV3Api;
  publicSpotKline?: PublicSpotKlineV3Api;
  publicMiniTicker?: PublicMiniTickerV3Api;
  publicMiniTickers?: PublicMiniTickersV3Api;
  publicBookTickerBatch?: PublicBookTickerBatchV3Api;
  publicIncreaseDepthsBatch?: PublicIncreaseDepthsBatchV3Api;
  publicAggreDepths?: PublicAggreDepthsV3Api;
  publicAggreDeals?: PublicAggreDealsV3Api;
  publicAggreBookTicker?: PublicAggreBookTickerV3Api;
}

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

export interface PublicBookTickerV3Api {
  bidPrice?: string;
  bidQuantity?: string;
  askPrice?: string;
  askQuantity?: string;
}

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

export interface PrivateAccountV3Api {
  vcoinName?: string;
  coinId?: string;
  balanceAmount?: string;
  balanceAmountChange?: string;
  frozenAmount?: string;
  frozenAmountChange?: string;
  type?: string;
  time?: number;
}

export interface PublicSpotKlineV3Api {
  interval?: string;
  windowStart?: number;
  openingPrice?: string;
  closingPrice?: string;
  highestPrice?: string;
  lowestPrice?: string;
  volume?: string;
  amount?: string;
  windowEnd?: number;
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

export interface PublicMiniTickersV3Api {
  items?: PublicMiniTickerV3Api[];
}

export interface PublicBookTickerBatchV3Api {
  items?: PublicBookTickerV3Api[];
}

export interface PublicIncreaseDepthsBatchV3Api {
  items?: PublicIncreaseDepthsV3Api[];
  eventType?: string;
}

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

export interface PublicAggreBookTickerV3Api {
  bidPrice?: string;
  bidQuantity?: string;
  askPrice?: string;
  askQuantity?: string;
}
