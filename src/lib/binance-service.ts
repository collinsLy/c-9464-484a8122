import { Spot } from '@binance/connector';

class BinanceService {
  private client: any;

  constructor() {
    const apiKey = 'ELvBEdZYMEld58KFbScOnbFsa2gsA5t2i8vCubTl8CyOSUWXxBjqMk2WOz6sAwgm';
    const apiSecret = 'uOTAEIJ44lTuXYUJK5KiW1rpT0lYFdBVkNLqihNmDpJdovGabLgV8ZjHamd6ifW9';
    this.client = new Spot(apiKey, apiSecret);
  }

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
      // Convert symbol format from BTCUSD to BTCUSDT for Binance API
      const binanceSymbol = symbol.replace('USD', 'USDT');
      const response = await fetch(`https://api.binance.com/api/v3/depth?symbol=${binanceSymbol}&limit=5`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching order book:', error);
      // Return empty data structure on error
      return { bids: [], asks: [] };
    }
  }

  async getKlines(symbol: string, interval: string) {
    try {
      const response = await this.client.klines(symbol, interval);
      return response.data;
    } catch (error) {
      console.error('Error fetching klines:', error);
      throw error;
    }
  }

  async get24hrTicker(symbol: string) {
    try {
      const response = await this.client.ticker24hr(symbol);
      return response.data;
    } catch (error) {
      console.error('Error fetching 24hr ticker:', error);
      throw error;
    }
  }

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