
// DexScreener API service
// API Docs: https://docs.dexscreener.com/api/reference

// Types
export interface DexToken {
  address: string;
  name: string;
  symbol: string;
}

export interface DexPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken?: DexToken;
  quoteToken?: DexToken;
  token0: { symbol: string };
  token1: { symbol: string };
  priceNative?: string;
  priceUsd?: string | null;
  txns?: {
    m5?: { buys: number; sells: number };
    h1?: { buys: number; sells: number };
    h24?: { buys: number; sells: number };
  };
  volume?: {
    h24: number;
    h6: number;
    h1: number;
  };
  volume24h: string;
  priceChange?: {
    m5: number;
    h1: number;
    h24: number;
  };
  liquidity: string;
  fdv?: number;
  createdAt?: number;
}

export interface DexScreenerResponse {
  pairs: DexPair[];
  schemaVersion: string;
}

// API endpoints
const BASE_URL = 'https://api.dexscreener.com/latest/dex';

/**
 * Fetch pairs by chain ID with optional limit
 * @param chainId - The blockchain ID (ethereum, bsc, etc.)
 * @param limit - Optional limit of results (max 100)
 */
export const fetchPairsByChain = async (chainId: string, limit?: number): Promise<DexPair[]> => {
  try {
    // For development and testing, return mock data to avoid API rate limits
    // When ready for production, uncomment the API call
    
    // const limitParam = limit ? `/${limit}` : '';
    // const response = await fetch(`${BASE_URL}/pairs/${chainId}${limitParam}`);
    
    // if (!response.ok) {
    //   throw new Error(`API error: ${response.status}`);
    // }
    
    // const data: DexScreenerResponse = await response.json();
    // return data.pairs || [];
    
    // Mock data for demonstration
    return [
      { 
        pairAddress: '0x123abc', 
        chainId: 'ethereum',
        dexId: 'uniswap',
        url: 'https://dexscreener.com/ethereum/0x123abc',
        token0: { symbol: 'ETH' }, 
        token1: { symbol: 'USDC' }, 
        volume24h: '1,000,000', 
        liquidity: '5,000,000' 
      },
      { 
        pairAddress: '0x456def', 
        chainId: 'ethereum',
        dexId: 'uniswap',
        url: 'https://dexscreener.com/ethereum/0x456def',
        token0: { symbol: 'BTC' }, 
        token1: { symbol: 'USDT' }, 
        volume24h: '2,000,000', 
        liquidity: '10,000,000' 
      },
      { 
        pairAddress: '0x789ghi', 
        chainId: 'ethereum',
        dexId: 'sushiswap',
        url: 'https://dexscreener.com/ethereum/0x789ghi',
        token0: { symbol: 'LINK' }, 
        token1: { symbol: 'ETH' }, 
        volume24h: '500,000', 
        liquidity: '3,000,000' 
      },
    ];
  } catch (error) {
    console.error('Error fetching DexScreener pairs:', error);
    throw error;
  }
};

/**
 * Search for pairs by token address
 * @param tokenAddress - The token contract address
 */
export const searchPairsByToken = async (tokenAddress: string): Promise<DexPair[]> => {
  try {
    const response = await fetch(`${BASE_URL}/tokens/${tokenAddress}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data: DexScreenerResponse = await response.json();
    return data.pairs || [];
  } catch (error) {
    console.error('Error searching DexScreener pairs:', error);
    throw error;
  }
};

/**
 * Search for pairs by pair address
 * @param pairAddress - The pair contract address
 */
export const getPairByAddress = async (pairAddress: string): Promise<DexPair[]> => {
  try {
    const response = await fetch(`${BASE_URL}/pairs/${pairAddress}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data: DexScreenerResponse = await response.json();
    return data.pairs || [];
  } catch (error) {
    console.error('Error fetching DexScreener pair:', error);
    throw error;
  }
};

/**
 * Search for pairs by token names or symbols
 * @param query - The search query
 */
export const searchPairs = async (query: string): Promise<DexPair[]> => {
  try {
    const response = await fetch(`${BASE_URL}/search?q=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data: DexScreenerResponse = await response.json();
    return data.pairs || [];
  } catch (error) {
    console.error('Error searching DexScreener:', error);
    throw error;
  }
};
