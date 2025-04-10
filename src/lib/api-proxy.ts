
// This file creates wrapper functions around API calls to help avoid CORS issues

/**
 * Function to fetch data from Binance API through a proxy or with appropriate headers
 * @param endpoint - The Binance API endpoint
 * @returns Promise with the response data
 */
export async function fetchBinanceData(endpoint: string) {
  try {
    // Use a CORS proxy if needed in development
    // In production, consider setting up a server-side proxy
    const corsProxy = '';
    const url = `${corsProxy}https://api.binance.com/api/v3/${endpoint}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching from Binance API:', error);
    // Return fallback data for demo purposes
    return createFallbackData(endpoint);
  }
}

/**
 * Creates fallback/demo data when API calls fail
 */
function createFallbackData(endpoint: string) {
  if (endpoint.includes('ticker')) {
    return {
      symbol: "BTCUSDT",
      price: "29850.00000000",
      priceChange: "1.75"
    };
  }
  
  if (endpoint.includes('depth')) {
    return {
      lastUpdateId: 12345678,
      bids: [["29800.00000000", "1.00000000"], ["29790.00000000", "2.00000000"]],
      asks: [["29850.00000000", "1.00000000"], ["29860.00000000", "2.00000000"]]
    };
  }
  
  return {};
}
