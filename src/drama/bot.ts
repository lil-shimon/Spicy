import { connectCoinw } from '../clients/coinw/coinw-ws';
import { calculateSpreadRate } from '../dirty-work/spread';
import { Asks, Bids } from './type';

const handleUpdate = (asks: Asks, bids: Bids) => {
  if (!bids || !asks) return;
  const bestBid = parseFloat(bids[0].p);
  const bestAsk = parseFloat(asks[0].p);

  const spreadRate = calculateSpreadRate(bestBid, bestAsk);
  console.log('spreadRate', spreadRate, 'bestBid', bestBid, 'bestAsk', bestAsk);
};

const startDrama = () => {
  connectCoinw({
    biz: 'futures',
    type: 'depth',
    pairCode: 'PUMP',
    onUpdate: handleUpdate,
    onError: (error) => {
      console.error('error', error);
    },
    onClose: () => {
      console.log('close');
    },
  });
};

startDrama();
