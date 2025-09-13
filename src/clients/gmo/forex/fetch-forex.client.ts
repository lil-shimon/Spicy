const endPoint = 'https://forex-api.coin.z.com/public';
const path = '/v1/ticker';

type PriceInfo = {
  symbol: string;
  ask: string;
  bid: string;
  timestamp: string;
  status: string;
};

export const fetchForex = async (): Promise<PriceInfo | null> => {
  const symbol = 'USD_JPY';

  try {
    const url = `${endPoint}${path}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const { data } = await response.json();

    const priceInfo = data.find(
      (item: { symbol: string }) => item.symbol === symbol
    );

    if (!priceInfo) {
      throw new Error(`指定されたシンボルのデータが見つかりません: ${symbol}`);
    }

    return priceInfo as PriceInfo;
  } catch (error) {
    console.error('GMOのFX価格取得に失敗しました', error);
    return null;
  }
};
