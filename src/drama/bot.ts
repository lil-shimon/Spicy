import { connectKucoin } from '../clients/kucoin/kucoin-ws';
import { calculateSpreadRate } from '../dirty-work/spread';

const handleUpdate = (bestBid: number, bestAsk: number) => {
  if (!bestBid || !bestAsk) return;

  const spreadRate = calculateSpreadRate(bestBid, bestAsk);
  console.log('KuCoin Futures - spreadRate', spreadRate, 'bestBid', bestBid, 'bestAsk', bestAsk);
};

const startDrama = () => {
  connectKucoin({
    pair: 'XBTUSDTM',
    marketType: 'futures',
    onUpdate: handleUpdate,
    onError: (error) => {
      console.error('KuCoin futures error', error);
    },
    onClose: () => {
      console.log('KuCoin futures closed');
    },
  });
};

startDrama();
