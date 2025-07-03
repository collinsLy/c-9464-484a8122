// This file serves as a proxy for API calls to prevent CORS issues
// and to keep API keys secure on the server side

export const fetchBinanceData = async (endpoint: string, params: Record<string, any> = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const url = `/api/v3/${endpoint}${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error(`Invalid response format for ${endpoint}:`, text);
      throw new Error(`Invalid response format: expected JSON but got ${contentType}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching Binance data (${endpoint}):`, error);
    throw error;
  }
};

export const FINNHUB_API_KEY = "cvqhhhpr01qp88clnd60cvqhhhpr01qp88clnd6g";
export const ALPHA_VANTAGE_API_KEY = "BUURNND6LTNPWVJE";
export const TWELVE_DATA_API_KEY = "bd6542a7833b4e4ebb503631cc1cb780";
export const CRYPTO_PANIC_API_KEY = "8bff507";

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