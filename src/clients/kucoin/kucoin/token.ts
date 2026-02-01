/**
 * Kucoinのスポット取引用トークンを取得
 */
export const getSpotToken = async () => {
  const tokenEndpoint = 'https://api.kucoin.com/api/v1/bullet-public';

  try {
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return data.data.token;
  } catch (error) {
    throw new Error(`Failed to fetch Kucoin spot token: ${error}`);
  }
};
