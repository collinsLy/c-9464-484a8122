
// This file serves as a proxy for API calls to prevent CORS issues
// and to keep API keys secure on the server side

export const fetchBinanceData = async (endpoint: string) => {
  try {
    const response = await fetch(`/api/v3/${endpoint}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching Binance data (${endpoint}):`, error);
    throw error;
  }
};

export const FINNHUB_API_KEY = "cvqhhhpr01qp88clnd60cvqhhhpr01qp88clnd6g";

export const fetchCoinGeckoData = async (endpoint: string) => {
  try {
    const response = await fetch(`https://api.coingecko.com/api/v3/${endpoint}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching CoinGecko data (${endpoint}):`, error);
    throw error;
  }
};

export const fetchAlphaVantageData = async (params: string) => {
  try {
    const apiKey = "BUURNND6LTNPWVJE";
    const response = await fetch(`https://www.alphavantage.co/query?${params}&apikey=${apiKey}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching Alpha Vantage data:`, error);
    throw error;
  }
};
