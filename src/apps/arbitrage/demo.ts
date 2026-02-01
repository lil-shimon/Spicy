import { kucoinFuturesClient } from '../../clients/kucoin/kucoin-client';

const startDemo = async () => {
  // await startDirtyWork('SOL/USDT', 0.001)
  // await startDirtyWork('SOL/USDC', 0.001)
  // await startDirtyWork('ADA/USDC', 1)
  // await startDirtyWork('ADA/USDT', 1)
  // await startDirtyWork('PUMP/USDT', 2000, 0.2)
  await kucoinFuturesClient.loadMarkets();
  const market = await kucoinFuturesClient.market('PUMPUSDTM');
  console.log('Market:', market);
};

startDemo();
