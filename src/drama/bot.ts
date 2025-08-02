import { connectCoinw } from '../clients/coinw/coinw-ws';

const handleUpdate = (asks: number, bids: number) => {
  console.log('bids', bids);
  console.log('asks', asks);
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
