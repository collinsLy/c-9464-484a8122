import { UserBalanceService, UserService } from './firebase-service';
import { fetchBinanceData, fetchCoinGeckoData } from './api-proxy';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface PreloadedData {
  userBalance: number;
  userProfile: any;
  prices: Map<string, number>;
  marketData: any;
  lastUpdated: Date;
}

interface PriceCache {
  [symbol: string]: {
    price: number;
    timestamp: number;
  };
}

class PreloadService {
  private static instance: PreloadService;
  private preloadedData: PreloadedData | null = null;
  private priceCache: PriceCache = {};
  private readonly CACHE_DURATION = 30 * 1000; // 30 seconds
  private isPreloading = false;
  private preloadCallbacks: ((data: PreloadedData) => void)[] = [];

  private constructor() {
    this.initializeAuthListener();
  }

  public static getInstance(): PreloadService {
    if (!PreloadService.instance) {
      PreloadService.instance = new PreloadService();
    }
    return PreloadService.instance;
  }

  private initializeAuthListener() {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.preloadUserData(user.uid);
      } else {
        this.clearPreloadedData();
      }
    });
  }

  public async preloadUserData(userId: string): Promise<void> {
    if (this.isPreloading) return;
    
    this.isPreloading = true;
    
    try {
      console.log('🚀 Starting preload for user:', userId);
      
      // Preload user data in parallel
      const [userBalance, userProfile, prices, marketData] = await Promise.all([
        this.preloadUserBalance(userId),
        this.preloadUserProfile(userId),
        this.preloadPrices(),
        this.preloadMarketData()
      ]);

      this.preloadedData = {
        userBalance,
        userProfile,
        prices,
        marketData,
        lastUpdated: new Date()
      };

      console.log('✅ Preload completed successfully');
      
      // Notify all callbacks
      this.preloadCallbacks.forEach(callback => callback(this.preloadedData!));
      
    } catch (error) {
      console.error('❌ Preload failed:', error);
    } finally {
      this.isPreloading = false;
    }
  }

  private async preloadUserBalance(userId: string): Promise<number> {
    try {
      return await UserBalanceService.getUserBalance(userId);
    } catch (error) {
      console.error('Error preloading user balance:', error);
      return 0;
    }
  }

  private async preloadUserProfile(userId: string): Promise<any> {
    try {
      return await UserService.getUserData(userId);
    } catch (error) {
      console.error('Error preloading user profile:', error);
      return null;
    }
  }

  private async preloadPrices(): Promise<Map<string, number>> {
    const prices = new Map<string, number>();
    const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT'];
    
    try {
      // Check cache first
      const cachedPrices = this.getCachedPrices(symbols);
      if (cachedPrices.length === symbols.length) {
        cachedPrices.forEach(({ symbol, price }) => {
          prices.set(symbol, price);
        });
        return prices;
      }

      // Fetch from API if not cached
      const pricePromises = symbols.map(async (symbol) => {
        try {
          const data = await fetchBinanceData(`ticker/price?symbol=${symbol}`);
          const price = parseFloat(data.price);
          
          // Cache the price
          this.priceCache[symbol] = {
            price,
            timestamp: Date.now()
          };
          
          return { symbol, price };
        } catch (error) {
          console.error(`Error fetching price for ${symbol}:`, error);
          return { symbol, price: 0 };
        }
      });

      const priceResults = await Promise.all(pricePromises);
      priceResults.forEach(({ symbol, price }) => {
        prices.set(symbol, price);
      });

    } catch (error) {
      console.error('Error preloading prices:', error);
    }

    return prices;
  }

  private async preloadMarketData(): Promise<any> {
    try {
      // Fetch basic market data
      const marketData = await fetchCoinGeckoData('coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1');
      return marketData;
    } catch (error) {
      console.error('Error preloading market data:', error);
      return null;
    }
  }

  private getCachedPrices(symbols: string[]): { symbol: string; price: number }[] {
    const now = Date.now();
    const cachedPrices: { symbol: string; price: number }[] = [];

    symbols.forEach(symbol => {
      const cached = this.priceCache[symbol];
      if (cached && (now - cached.timestamp) < this.CACHE_DURATION) {
        cachedPrices.push({ symbol, price: cached.price });
      }
    });

    return cachedPrices;
  }

  public getPreloadedData(): PreloadedData | null {
    return this.preloadedData;
  }

  public getCachedPrice(symbol: string): number | null {
    const cached = this.priceCache[symbol];
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      return cached.price;
    }
    return null;
  }

  public onPreloadComplete(callback: (data: PreloadedData) => void): void {
    this.preloadCallbacks.push(callback);
  }

  public clearPreloadedData(): void {
    this.preloadedData = null;
    this.priceCache = {};
    this.preloadCallbacks = [];
  }

  public isDataStale(): boolean {
    if (!this.preloadedData) return true;
    
    const now = new Date();
    const timeDiff = now.getTime() - this.preloadedData.lastUpdated.getTime();
    return timeDiff > this.CACHE_DURATION;
  }

  public async refreshData(): Promise<void> {
    if (auth.currentUser) {
      await this.preloadUserData(auth.currentUser.uid);
    }
  }
}

export const preloadService = PreloadService.getInstance();