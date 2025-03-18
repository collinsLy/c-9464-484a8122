
import axios from 'axios';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

export const getTopCoins = async () => {
  try {
    const response = await axios.get(`${COINGECKO_API}/coins/markets`, {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 10,
        sparkline: false
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching top coins:', error);
    return [];
  }
};

export const getCoinPrice = async (coinId: string) => {
  try {
    const response = await axios.get(`${COINGECKO_API}/simple/price`, {
      params: {
        ids: coinId,
        vs_currencies: 'usd'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching coin price:', error);
    return null;
  }
};
