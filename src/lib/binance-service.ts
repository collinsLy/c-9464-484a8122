
import { Spot } from '@binance/connector';

class BinanceService {
  private client: any;

  constructor() {
    const apiKey = process.env.BINANCE_API_KEY;
    const apiSecret = process.env.BINANCE_SECRET_KEY;
    this.client = new Spot(apiKey, apiSecret);
  }

  // Market Data
  async getPrice(symbol: string) {
    try {
      const response = await this.client.tickerPrice(symbol);
      return response.data;
    } catch (error) {
      console.error('Error fetching price:', error);
      throw error;
    }
  }

  async getOrderBook(symbol: string) {
    try {
      const response = await this.client.depth(symbol);
      return response.data;
    } catch (error) {
      console.error('Error fetching order book:', error);
      throw error;
    }
  }

  // Trading
  async placeBuyOrder(symbol: string, quantity: number, price?: number) {
    try {
      const params = price 
        ? { symbol, side: 'BUY', type: 'LIMIT', quantity, price }
        : { symbol, side: 'BUY', type: 'MARKET', quantity };
      const response = await this.client.newOrder(params);
      return response.data;
    } catch (error) {
      console.error('Error placing buy order:', error);
      throw error;
    }
  }

  async placeSellOrder(symbol: string, quantity: number, price?: number) {
    try {
      const params = price 
        ? { symbol, side: 'SELL', type: 'LIMIT', quantity, price }
        : { symbol, side: 'SELL', type: 'MARKET', quantity };
      const response = await this.client.newOrder(params);
      return response.data;
    } catch (error) {
      console.error('Error placing sell order:', error);
      throw error;
    }
  }

  async getAccountBalance() {
    try {
      const response = await this.client.account();
      return response.data.balances;
    } catch (error) {
      console.error('Error fetching balance:', error);
      throw error;
    }
  }
}

export const binanceService = new BinanceService();
