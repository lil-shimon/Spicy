type Params = {
  pair: string;
};

export const fetchSnapshot = async (params: Params) => {
  const { pair } = params;

  const url = `https://api.kucoin.com/api/v1/market/orderbook/level2_20?symbol=${pair}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
    });
    const data = await response.json();

    console.log('Kucoin snapshot data:', data);
    return data;
  } catch (error) {
    throw new Error(`Failed to fetch Kucoin snapshot: ${error}`);
  }
};
