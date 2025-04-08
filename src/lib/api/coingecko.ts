import { toast } from "sonner";

const COINGECKO_API_KEY = "CG-vfbBd2nG74YmzzoytroimuaZ";
const BASE_URL = "https://api.coingecko.com/api/v3";

// Retaining original, more comprehensive interfaces
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

interface CoinData {
  id: string;
  symbol: string;
  name: string;
  market_data?: {
    current_price: {
      usd: number;
    };
    price_change_percentage_24h: number;
  };
}

export const fetchCoinGeckoData = async (coinId: string): Promise<CoinData | null> => {
  try {
    const response = await fetch(
      `${BASE_URL}/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true&x_cg_api_key=${COINGECKO_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data[coinId]) {
      throw new Error("Coin data not found");
    }

    return {
      id: coinId,
      symbol: coinId,
      name: coinId.toUpperCase(),
      market_data: {
        current_price: {
          usd: data[coinId].usd,
        },
        price_change_percentage_24h: data[coinId].usd_24h_change || 0,
      },
    };
  } catch (error) {
    console.error("CoinGecko API error:", error);
    toast.error("Failed to fetch cryptocurrency data");
    return null;
  }
};

export const getCoinMarketData = async (coinIds: string[]): Promise<CoinData[]> => {
  try {
    const idsParam = coinIds.join(",");
    const response = await fetch(
      `${BASE_URL}/simple/price?ids=${idsParam}&vs_currencies=usd&include_24hr_change=true&x_cg_api_key=${COINGECKO_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return Object.entries(data).map(([id, priceData]: [string, any]) => ({
      id,
      symbol: id,
      name: id.toUpperCase(),
      market_data: {
        current_price: {
          usd: priceData.usd,
        },
        price_change_percentage_24h: priceData.usd_24h_change || 0,
      },
    }));
  } catch (error) {
    console.error("CoinGecko API error:", error);
    toast.error("Failed to fetch market data");
    return [];
  }
};

// Removed functions: getTopCoins, getCoinData, getCoinPrice, getCoingeckoIdFromSymbol, getFormattedPrice
// as they are replaced by the new fetchCoinGeckoData and getCoinMarketData functions.