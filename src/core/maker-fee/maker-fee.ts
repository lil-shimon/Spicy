import { Exchange, MAKER_FEES_FUTURES, MAKER_FEES_SPOT } from '../../constants';

export const getMakerFeeFutures = (exchange: Exchange) => {
  const makerFee =
    MAKER_FEES_FUTURES[exchange as keyof typeof MAKER_FEES_FUTURES];
  if (makerFee === undefined) {
    throw new Error(
      `Maker fee for futures exchange ${exchange} is not defined.`
    );
  }

  return makerFee;
};

export const getMakerFeeSpot = (exchange: Exchange) => {
  const makerFee = MAKER_FEES_SPOT[exchange as keyof typeof MAKER_FEES_SPOT];

  if (makerFee === undefined) {
    throw new Error(`Maker fee for spot exchange ${exchange} is not defined.`);
  }

  return makerFee;
};
