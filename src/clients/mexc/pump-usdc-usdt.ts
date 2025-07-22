import { PAIRS } from '../../constants';
import { mexcClient } from './mexc-client';

const fetchPumpUsdc = async () => {
  const ticker = await mexcClient.fetchTicker(PAIRS.PUMP_USDC);
  console.log('PUMP/USDC:', ticker);

  return {
    bid: ticker.bid,
    ask: ticker.ask,
  };
};

const fetchPumpUsdt = async () => {
  const ticker = await mexcClient.fetchTicker(PAIRS.PUMP_USDT);
  console.log('PUMP/USDT:', ticker);

  return {
    bid: ticker.bid,
    ask: ticker.ask,
  };
};

export const fetchUsdcUsdt = async () => {
  const ticker = await mexcClient.fetchTicker('USDC/USDT');
  console.log('USDC/USDT:', ticker);

  return {
    bid: ticker.bid,
    ask: ticker.ask,
  };
};

export const run = async () => {
  const pumpUsdc = fetchPumpUsdc();
  const pumpUsdt = fetchPumpUsdt();
  const usdcUsdt = fetchUsdcUsdt();

  const result = await Promise.all([pumpUsdc, pumpUsdt, usdcUsdt]);
  console.log('Mexc Ticker:', result);
};
