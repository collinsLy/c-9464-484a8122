// Binance service for fetching market data
class BinanceService {
  private baseUrl = 'https://api.binance.com/api/v3';

  async getOrderBook(symbol: string) {
    try {
      const binanceSymbol = symbol.replace(/USD$/, 'USDT').toUpperCase();
      const response = await fetch(`${this.baseUrl}/depth?symbol=${binanceSymbol}&limit=20`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.msg || `Failed to fetch order book: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.bids || !data.asks) {
        throw new Error('Invalid order book data structure');
      }

      return data;
    } catch (error) {
      console.error('Error fetching order book:', error);
      throw error; // Let the component handle the error
    }
  }

  async getPrice(symbol: string) {
    try {
      const response = await fetch(`${this.baseUrl}/ticker/price?symbol=${symbol}`);
      if (!response.ok) {
        throw new Error('Failed to fetch price');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching price:', error);
      throw error;
    }
  }

  async getKlines(symbol: string, interval: string) {
    try {
      const response = await fetch(`${this.baseUrl}/klines?symbol=${symbol}&interval=${interval}&limit=1000`); // Adjust limit as needed
      if (!response.ok) {
          throw new Error('Failed to fetch klines');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching klines:', error);
      throw error;
    }
  }

  async get24hrTicker(symbol: string) {
    try {
      const response = await fetch(`${this.baseUrl}/ticker/24hr?symbol=${symbol}`);
      if (!response.ok) {
        throw new Error('Failed to fetch 24hr ticker');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching 24hr ticker:', error);
      throw error;
    }
  }


  async placeBuyOrder(symbol: string, quantity: number, price?: number) {
    try {
      const params = new URLSearchParams({
        symbol,
        side: 'BUY',
        type: price ? 'LIMIT' : 'MARKET',
        quantity: quantity.toString(),
        price: price?.toString() || '',
      });
      const response = await fetch(`${this.baseUrl}/order?${params.toString()}`, {
          method: 'POST',
          headers: {
              'X-MBX-APIKEY': 'ELvBEdZYMEld58KFbScOnbFsa2gsA5t2i8vCubTl8CyOSUWXxBjqMk2WOz6sAwgm' // Replace with your actual API key
          }
      });

      if (!response.ok) {
        throw new Error(`Failed to place buy order: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error placing buy order:', error);
      throw error;
    }
  }

  async placeSellOrder(symbol: string, quantity: number, price?: number) {
    try {
      const params = new URLSearchParams({
        symbol,
        side: 'SELL',
        type: price ? 'LIMIT' : 'MARKET',
        quantity: quantity.toString(),
        price: price?.toString() || '',
      });
      const response = await fetch(`${this.baseUrl}/order?${params.toString()}`, {
          method: 'POST',
          headers: {
              'X-MBX-APIKEY': 'ELvBEdZYMEld58KFbScOnbFsa2gsA5t2i8vCubTl8CyOSUWXxBjqMk2WOz6sAwgm' // Replace with your actual API key
          }
      });
      if (!response.ok) {
        throw new Error(`Failed to place sell order: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error placing sell order:', error);
      throw error;
    }
  }

  async getAccountBalance() {
    try {
      const response = await fetch(`${this.baseUrl}/account`, {
        method: 'GET',
        headers: {
          'X-MBX-APIKEY': 'ELvBEdZYMEld58KFbScOnbFsa2gsA5t2i8vCubTl8CyOSUWXxBjqMk2WOz6sAwgm' // Replace with your actual API key
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch account balance: ${response.statusText}`);
      }
      const data = await response.json();
      return data.balances;
    } catch (error) {
      console.error('Error fetching balance:', error);
      throw error;
    }
  }
}

export const binanceService = new BinanceService();