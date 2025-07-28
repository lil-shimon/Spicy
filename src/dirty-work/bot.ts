import { connectCoinw } from '../clients/coinw/coinw-ws';

const handleUpdate = (bestBid: number, bestAsk: number) => {
  console.log('Best Bid:', bestBid);
  console.log('Best Ask:', bestAsk);
};

export const startDirtyWork = async () => {
  console.log('MMBot start');
  connectCoinw({
    onUpdate: handleUpdate,
    onError: (error) => {
      console.error('Coinw error:', error);
    },
    onClose: () => {
      console.log('Coinw connection closed');
    },
  });
};
