const endPoint = 'https://forex-api.coin.z.com/public';
const path = '/v1/ticker';

export const fetchForex = async () => {
  const url = `${endPoint}${path}`;
  const response = await fetch(url);
  return response.json();
};
