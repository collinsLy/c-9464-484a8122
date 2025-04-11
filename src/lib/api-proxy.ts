
/**
 * API Proxy service to handle CORS issues when calling external APIs
 */

// Function to fetch Binance data through a proxy if needed
export async function fetchBinanceData(endpoint: string) {
  try {
    // Try direct API call first (will work in production with proper CORS headers)
    const response = await fetch(`https://api.binance.com/api/v3/${endpoint}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching from Binance API directly:", error);
    
    // If direct call fails, try using a CORS proxy
    // You could also set up a server-side proxy instead
    try {
      const corsProxyUrl = "https://corsproxy.io/?";
      const targetUrl = `https://api.binance.com/api/v3/${endpoint}`;
      const response = await fetch(corsProxyUrl + encodeURIComponent(targetUrl));
      return await response.json();
    } catch (proxyError) {
      console.error("Error fetching from Binance API via proxy:", proxyError);
      throw proxyError;
    }
  }
}

// Function to fetch CoinGecko data through a proxy if needed
export async function fetchCoinGeckoData(endpoint: string) {
  try {
    // Try direct API call first
    const response = await fetch(`https://api.coingecko.com/api/v3/${endpoint}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching from CoinGecko API directly:", error);
    
    // If direct call fails, try using a CORS proxy
    try {
      const corsProxyUrl = "https://corsproxy.io/?";
      const targetUrl = `https://api.coingecko.com/api/v3/${endpoint}`;
      const response = await fetch(corsProxyUrl + encodeURIComponent(targetUrl));
      return await response.json();
    } catch (proxyError) {
      console.error("Error fetching from CoinGecko API via proxy:", proxyError);
      throw proxyError;
    }
  }
}

// Helper function for Alpha Vantage API
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
