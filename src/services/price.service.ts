import { gmoWebSocketClient } from '../clients/gmo/gmo-ws';

type PriceServiceParams = {
  symbol: string;
};

export const PriceService = () => {
  const handleUpdate = (bid: number, ask: number) => {
    console.log(`Price update: bid=${bid}, ask=${ask}`);
  };

  const start = (params: PriceServiceParams) => {
    const { symbol } = params;
    gmoWebSocketClient({ symbol, onUpdate: handleUpdate });
  };

  return { start };
};
