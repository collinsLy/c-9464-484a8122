
import { getDatabase, ref, set, onValue } from 'firebase/database';
import { getCoinData } from './api/coingecko';
import { db } from './firebase';

export class PriceService {
  private static pricesRef = ref(getDatabase(), 'prices');
  private static updateInterval: NodeJS.Timeout | null = null;

  static async updatePrices() {
    try {
      const coinIds = ['bitcoin', 'tether', 'binancecoin', 'worldcoin', 'usd-coin', 'solana'];
      const pricesData = await Promise.all(
        coinIds.map(id => getCoinData(id))
      );
      
      const prices: Record<string, number> = {};
      pricesData.forEach((data, index) => {
        if (data?.market_data?.current_price?.usd) {
          const symbol = this.getCoinSymbol(coinIds[index]);
          prices[symbol] = data.market_data.current_price.usd;
        }
      });

      await set(this.pricesRef, {
        prices,
        lastUpdated: Date.now()
      });
    } catch (error) {
      console.error('Error updating prices:', error);
    }
  }

  static startPriceUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    
    this.updatePrices();
    this.updateInterval = setInterval(() => this.updatePrices(), 30000);
  }

  static stopPriceUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  static subscribeToPrices(callback: (prices: Record<string, number>) => void) {
    return onValue(this.pricesRef, (snapshot) => {
      const data = snapshot.val();
      if (data?.prices) {
        callback(data.prices);
      }
    });
  }

  private static getCoinSymbol(coinId: string): string {
    const symbolMap: Record<string, string> = {
      'bitcoin': 'BTC',
      'tether': 'USDT',
      'binancecoin': 'BNB',
      'worldcoin': 'WLD',
      'usd-coin': 'USDC',
      'solana': 'SOL'
    };
    return symbolMap[coinId] || coinId.toUpperCase();
  }
}
