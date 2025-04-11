// This file serves as a proxy for external API calls to avoid CORS issues

/**
 * Creates a proxy fetch function that adds the necessary headers and handles CORS
 * @param baseUrl The base URL for the API
 * @returns A function that makes the API request with CORS handled
 */
const createProxyFetch = (baseUrl: string) => {
  return async (endpoint: string, options = {}) => {
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  };
};

// Setup proxy handlers for common API endpoints
export const fetchBinanceData = createProxyFetch('https://api.binance.com');
export const fetchCoinGeckoData = createProxyFetch('https://api.coingecko.com/api/v3');
export const fetchTwelveData = createProxyFetch('https://api.twelvedata.com');

// Helper function for Alpha Vantage API (retained from original code)
export async function fetchAlphaVantageData(params: string) {
  try {
    const apiKey = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY || "demo";
    const response = await fetch(
      `https://www.alphavantage.co/query?${params}&apikey=${apiKey}`
    );
    return await response.json();
  } catch (error) {
    console.error("Error fetching from Alpha Vantage API:", error);
    throw error;
  }
}

// Express route handler for API proxying (from edited code)
export const handleBinanceProxy = async (req, res) => {
  const { path, ...params } = req.query;
  const queryString = new URLSearchParams(params).toString();
  const url = `https://api.binance.com/${path}?${queryString}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};