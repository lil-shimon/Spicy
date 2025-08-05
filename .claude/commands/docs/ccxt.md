---
description: 'Read CCXT documentation for unified cryptocurrency exchange integration'
allowed-tools: ['WebFetch']
---

# CCXT Documentation Reader

Read comprehensive CCXT documentation for unified cryptocurrency exchange API integration.

## Available Sections

- `manual` - Main manual and getting started guide
- `exchanges` - Supported exchanges and their specific details
- `api` - API reference for methods and classes
- `trading` - Trading operations (orders, markets, fees)
- `data` - Market data fetching (tickers, orderbooks, trades)
- `auth` - Authentication and API key management
- `errors` - Error handling and troubleshooting
- `advanced` - Advanced features (rate limiting, proxies, websockets)

---

Parse the requested section from $ARGUMENTS and fetch the appropriate documentation:

**Core Documentation (manual):**
https://github.com/ccxt/ccxt/wiki/Manual
https://github.com/ccxt/ccxt/wiki/Exchange-Markets
https://github.com/ccxt/ccxt/wiki/CCXT-Pro-Manual

**Supported Exchanges (exchanges):**
https://github.com/ccxt/ccxt/wiki/Exchange-Markets
https://github.com/ccxt/ccxt/wiki/Exchanges
https://github.com/ccxt/ccxt/wiki/Exchanges-By-Country

**API Reference (api):**
https://github.com/ccxt/ccxt/wiki/Manual#public-api
https://github.com/ccxt/ccxt/wiki/Manual#private-api
https://github.com/ccxt/ccxt/wiki/Manual#unified-api

**Trading Operations (trading):**
https://github.com/ccxt/ccxt/wiki/Manual#orders
https://github.com/ccxt/ccxt/wiki/Manual#querying-orders
https://github.com/ccxt/ccxt/wiki/Manual#my-trades
https://github.com/ccxt/ccxt/wiki/Manual#trading-fees

**Market Data (data):**
https://github.com/ccxt/ccxt/wiki/Manual#market-data
https://github.com/ccxt/ccxt/wiki/Manual#price-tickers
https://github.com/ccxt/ccxt/wiki/Manual#order-book
https://github.com/ccxt/ccxt/wiki/Manual#trades-executions-transactions

**Authentication (auth):**
https://github.com/ccxt/ccxt/wiki/Manual#authentication
https://github.com/ccxt/ccxt/wiki/Manual#api-keys-setup
https://github.com/ccxt/ccxt/wiki/Manual#overriding-nonce

**Error Handling (errors):**
https://github.com/ccxt/ccxt/wiki/Manual#error-handling
https://github.com/ccxt/ccxt/wiki/Manual#troubleshooting
https://github.com/ccxt/ccxt/wiki/Manual#exchanges-that-require-additional-credential

**Advanced Features (advanced):**
https://github.com/ccxt/ccxt/wiki/Manual#rate-limit
https://github.com/ccxt/ccxt/wiki/Manual#cors-access-control-allow-origin
https://github.com/ccxt/ccxt/wiki/CCXT-Pro-Manual
https://github.com/ccxt/ccxt/wiki/Manual#proxy

## Implementation Notes

### Key CCXT Concepts

**Unified API:**

- CCXT provides a unified interface across all exchanges
- Methods like `fetchTicker()`, `fetchOrderBook()`, `createOrder()` work across exchanges
- Exchange-specific parameters can be passed via `params` object

**Market Loading:**

- Always call `await exchange.loadMarkets()` before trading operations
- Markets are cached after first load
- Use `exchange.reload()` to refresh market data

**Rate Limiting:**

- CCXT has built-in rate limiter with `enableRateLimit: true`
- Exchange-specific rate limits are automatically handled
- Additional delays can be added with `rateLimit` property

**Error Types:**

- `BaseError` - Parent class for all errors
- `NetworkError` - Connection issues
- `ExchangeError` - Exchange-specific errors
- `InvalidOrder` - Order validation errors
- `InsufficientFunds` - Balance issues

**Common Patterns:**

```javascript
// Initialize exchange
const exchange = new ccxt.binance({
  apiKey: 'YOUR_API_KEY',
  secret: 'YOUR_SECRET',
  enableRateLimit: true,
});

// Load markets
await exchange.loadMarkets();

// Fetch ticker
const ticker = await exchange.fetchTicker('BTC/USDT');

// Create order
const order = await exchange.createOrder(
  'BTC/USDT',
  'limit',
  'buy',
  0.1,
  50000
);
```

Based on $ARGUMENTS, read the relevant documentation sections using WebFetch with prompts focused on unified exchange integration needs.
