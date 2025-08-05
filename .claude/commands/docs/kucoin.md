---
description: 'Read KuCoin API documentation for trading bot development'
allowed-tools: ['WebFetch']
---

# KuCoin API Documentation Reader

Read comprehensive KuCoin API documentation for cryptocurrency trading bot development.

## Available Sections

- `intro` - API introduction and authentication
- `spot` - Spot trading (market data + orders)
- `futures` - Futures trading (market data + orders)
- `websocket` - WebSocket API for real-time data (spot & futures)
- `account` - Account info and balance management
- `fees` - Trading fees information
- `currencies` - Available currencies and details
- `withdrawals` - Withdrawal functionality

---

Parse the requested section from $ARGUMENTS and fetch the appropriate documentation:

**Core Documentation (intro):**
https://www.kucoin.com/docs-new/introduction
https://www.kucoin.com/docs-new/rest/futures-trading/introduction
https://www.kucoin.com/docs-new/websocket-api/base-info/introduction

**Spot Trading (spot):**
https://www.kucoin.com/docs-new/rest/spot-trading/market-data/get-ticker
https://www.kucoin.com/docs-new/rest/spot-trading/orders/add-order-test
https://www.kucoin.com/docs-new/rest/spot-trading/market-data/get-all-currencies

**Futures Trading (futures):**
https://www.kucoin.com/docs-new/rest/futures-trading/market-data/get-full-orderbook
https://www.kucoin.com/docs-new/rest/futures-trading/market-data/get-all-symbols
https://www.kucoin.com/docs-new/rest/futures-trading/orders/add-order

**Account Management (account):**
https://www.kucoin.com/docs-new/3473260e0

**Trading Fees (fees):**
https://www.kucoin.com/docs-new/3470095w0

**WebSocket API (websocket):**
https://www.kucoin.com/docs-new/websocket-api/base-info/introduction
https://www.kucoin.com/docs-new/websocket-api/base-info/get-public-token-futures
https://www.kucoin.com/docs/websocket/futures-trading/public-channels/get-ticker-v2

**Withdrawals (withdrawals):**
https://www.kucoin.com/docs-new/rest/account-info/withdrawals/withdraw-v3

## Implementation Notes

### WebSocket Futures vs Spot Differences

**Token Endpoints:**

- Spot: `https://api.kucoin.com/api/v1/bullet-public`
- Futures: `https://api-futures.kucoin.com/api/v1/bullet-public`

**WebSocket Endpoints:**

- Spot: `wss://ws-api-spot.kucoin.com/`
- Futures: `wss://ws-api-futures.kucoin.com/`

**Topic Formats:**

- Spot: `/market/ticker:{symbol}` (e.g., `/market/ticker:BTC-USDT`)
- Futures: `/contractMarket/tickerV2:{symbol}` (e.g., `/contractMarket/tickerV2:XBTUSDTM`)

**Data Structure:**

- Spot: `data.bestBid`, `data.bestAsk`
- Futures: `data.bestBidPrice`, `data.bestAskPrice` (returned as strings, need parseFloat)

**Connection Settings:**

- Spot: Standard ping interval
- Futures: 18-second ping interval required

Based on $ARGUMENTS, read the relevant documentation sections using WebFetch with prompts focused on trading bot development needs.
