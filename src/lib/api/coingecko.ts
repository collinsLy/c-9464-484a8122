
import { toast } from "sonner";

// CoinGecko API client with key
const COINGECKO_API_KEY = "CG-vfbBd2nG74YmzzoytroimuaZ";
const COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3";

// Define interfaces for API responses
export interface CoinMarketData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number | null;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number | null;
  max_supply: number | null;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  last_updated: string;
}

export interface CoinDetailData {
  id: string;
  symbol: string;
  name: string;
  categories: string[];
  description: { en: string };
  image: { thumb: string; small: string; large: string };
  market_data: {
    current_price: { [key: string]: number };
    market_cap: { [key: string]: number };
    total_volume: { [key: string]: number };
    price_change_percentage_24h: number;
    price_change_percentage_7d: number;
    price_change_percentage_30d: number;
    high_24h: { [key: string]: number };
    low_24h: { [key: string]: number };
    ath: { [key: string]: number };
    ath_date: { [key: string]: string };
  };
  market_cap_rank: number;
  community_data: {
    twitter_followers: number;
    reddit_subscribers: number;
  };
  developer_data: {
    forks: number;
    stars: number;
    subscribers: number;
  };
  public_interest_stats: {
    alexa_rank: number;
  };
  last_updated: string;
}

// Helper function to fetch data from CoinGecko
const fetchCoinGeckoData = async <T>(endpoint: string, params: Record<string, string> = {}): Promise<T> => {
  try {
    const queryParams = new URLSearchParams({
      ...params,
      x_cg_api_key: COINGECKO_API_KEY
    });
    
    const url = `${COINGECKO_BASE_URL}${endpoint}?${queryParams.toString()}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }
    
    return await response.json() as T;
  } catch (error) {
    console.error("CoinGecko API error:", error);
    toast.error("Failed to fetch market data");
    throw error;
  }
};

// API functions
export const getTopCoins = async (currency = "usd", limit = 50): Promise<CoinMarketData[]> => {
  return fetchCoinGeckoData<CoinMarketData[]>(
    "/coins/markets", 
    { vs_currency: currency, per_page: limit.toString(), order: "market_cap_desc" }
  );
};

export const getCoinData = async (coinId: string): Promise<CoinDetailData> => {
  return fetchCoinGeckoData<CoinDetailData>(
    `/coins/${coinId}`,
    { localization: "false", tickers: "false", market_data: "true", community_data: "true", developer_data: "true" }
  );
};

export const getCoinPrice = async (coinId: string, currency = "usd"): Promise<Record<string, { [key: string]: number }>> => {
  return fetchCoinGeckoData<Record<string, { [key: string]: number }>>(
    `/simple/price`,
    { ids: coinId, vs_currencies: currency, include_24hr_change: "true" }
  );
};

// Helper to convert exchange symbols to CoinGecko IDs
export const getCoingeckoIdFromSymbol = (symbol: string): string => {
  const mapping: Record<string, string> = {
    "BTCUSD": "bitcoin",
    "ETHUSD": "ethereum",
    "SOLUSD": "solana",
    "BNBUSD": "binancecoin",
    "ADAUSD": "cardano",
    "DOTUSD": "polkadot",
    "XRPUSD": "ripple"
  };
  
  return mapping[symbol] || symbol.toLowerCase().slice(0, 3);
};

// Get trading pairs in format expected by the app
export const getFormattedPrice = (coinData: CoinMarketData): number => {
  return coinData?.current_price || 0;
};
export const getRealTimePrice = async (symbol: string) => {
  try {
    const coin = symbol.toLowerCase().replace('usdt', '');
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd&include_24hr_change=true`);
    const data = await response.json();
    return {
      price: data[coin]?.usd || 0,
      change24h: data[coin]?.usd_24h_change || 0
    };
  } catch (error) {
    console.error('Error fetching real-time price:', error);
    return { price: 0, change24h: 0 };
  }
};

export const getMultipleRealTimePrices = async (symbols: string[]) => {
  try {
    const coins = symbols.map(s => s.toLowerCase().replace('usdt', '')).join(',');
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coins}&vs_currencies=usd&include_24hr_change=true`);
    const data = await response.json();
    return symbols.reduce((acc, symbol) => {
      const coin = symbol.toLowerCase().replace('usdt', '');
      acc[symbol] = {
        price: data[coin]?.usd || 0,
        change24h: data[coin]?.usd_24h_change || 0
      };
      return acc;
    }, {});
  } catch (error) {
    console.error('Error fetching multiple prices:', error);
    return {};
  }
};
