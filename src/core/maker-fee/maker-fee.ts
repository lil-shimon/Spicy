import { Exchange, MAKER_FEES_FUTURES } from '../../constants';

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
