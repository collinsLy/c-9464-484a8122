
import { toast } from "sonner";

// CoinGecko API client with key
const COINGECKO_API_KEY = "CG-vfbBd2nG74YmzzoytroimuaZ";
const COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3";

// Cache implementation
interface CacheItem<T> {
  data: T;
  timestamp: number;
}

class ApiCache {
  private cache: Record<string, CacheItem<any>> = {};
  private cacheDuration = 60000; // 1 minute cache duration by default

  constructor(cacheDuration?: number) {
    if (cacheDuration) {
      this.cacheDuration = cacheDuration;
    }
  }

  get<T>(key: string): T | null {
    const item = this.cache[key];
    if (!item) return null;

    const now = Date.now();
    if (now - item.timestamp > this.cacheDuration) {
      // Cache expired
      delete this.cache[key];
      return null;
    }

    return item.data;
  }

  set<T>(key: string, data: T): void {
    this.cache[key] = {
      data,
      timestamp: Date.now()
    };
  }
}

// Rate limiting implementation
class RateLimiter {
  private lastRequestTime = 0;
  private requestInterval = 1500; // 1.5 seconds between requests

  async throttle(): Promise<void> {
    const now = Date.now();
    const timeToWait = this.lastRequestTime + this.requestInterval - now;
    
    if (timeToWait > 0) {
      await new Promise(resolve => setTimeout(resolve, timeToWait));
    }
    
    this.lastRequestTime = Date.now();
  }
}

// Create instances
const cache = new ApiCache(300000); // 5 minute cache
const rateLimiter = new RateLimiter();

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
    // Generate cache key
    const queryParams = new URLSearchParams(params);
    const cacheKey = `${endpoint}?${queryParams.toString()}`;
    
    // Check cache first
    const cachedData = cache.get<T>(cacheKey);
    if (cachedData) {
      console.log(`Using cached data for ${cacheKey}`);
      return cachedData;
    }
    
    // Apply rate limiting
    await rateLimiter.throttle();
    
    // Create a proxy URL that will be handled by your backend or dev server
    const url = `/api/coingecko${endpoint}?${queryParams.toString()}`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (response.status === 429) {
      console.warn("Rate limit exceeded. Using last cached data if available or showing error.");
      toast.error("API rate limit exceeded. Data may be stale.");
      
      // If we have cached data (even if expired), return it as fallback
      const fallbackData = cache.get<T>(cacheKey);
      if (fallbackData) return fallbackData;
      
      return {} as T;
    }
    
    if (!response.ok) {
      console.error(`API error: ${response.status}`);
      return {} as T;
    }
    
    const data = await response.json();
    
    // Store in cache
    cache.set<T>(cacheKey, data);
    
    return data as T;
  } catch (error) {
    console.error("CoinGecko API error:", error);
    return {} as T;
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
    "XRPUSD": "ripple",
    "USDTUSD": "tether",
    "WLDUSD": "worldcoin"
  };
  
  return mapping[symbol] || symbol.toLowerCase().replace("usd", "");
};

// Get trading pairs in format expected by the app
export const getFormattedPrice = (coinData: CoinMarketData): number => {
  return coinData?.current_price || 0;
};
