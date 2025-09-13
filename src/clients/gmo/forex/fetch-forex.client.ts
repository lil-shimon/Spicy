const endPoint = 'https://forex-api.coin.z.com/public';
const path = '/v1/ticker';

export const fetchForex = async () => {
  try {
    const url = `${endPoint}${path}`;
    const response = await fetch(url);
    return response.json();
  } catch (error) {
    console.error('GMOのFX価格取得に失敗しました', error);
    return null;
  }
};

fetchForex();
