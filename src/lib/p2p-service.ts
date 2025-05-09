import { toast } from "sonner";

export interface P2POffer {
  id: string;
  user: {
    name: string;
    avatar: string;
    rating: number;
    completedTrades: number;
  };
  crypto: string;
  price: number;
  fiatCurrency: string;
  paymentMethods: string[];
  limits: {
    min: number;
    max: number;
  };
  availableAmount: number;
  terms: string;
  createdAt: Date;
}

export interface P2POrder {
  id: string;
  offerId: string;
  type: 'buy' | 'sell';
  status: 'pending' | 'completed' | 'cancelled' | 'disputed';
  amount: number;
  total: number;
  crypto: string;
  fiatCurrency: string;
  createdAt: Date;
  seller: string;
  buyer: string;
  paymentMethod: string;
}

// API endpoint for crypto prices
const CRYPTO_PRICE_API = "https://api.coingecko.com/api/v3/simple/price";

class P2PService {
  private buyOffers: P2POffer[] = [];
  private sellOffers: P2POffer[] = [];
  private userOrders: P2POrder[] = [];
  private cryptoPrices: Record<string, number> = {};
  private lastPriceUpdate: number = 0;
  private priceUpdateInterval: number = 60000; // 1 minute

  constructor() {
    // Initialize with dynamic data based on current prices
    this.initializeService();
  }

  private async initializeService() {
    try {
      // Fetch initial prices
      await this.updateCryptoPrices();

      // Setup interval for price updates
      setInterval(() => this.updateCryptoPrices(), this.priceUpdateInterval);
    } catch (error) {
      console.error("Failed to initialize P2P service:", error);
    }
  }

  private async updateCryptoPrices() {
    try {
      const cryptoIds = "bitcoin,ethereum,tether,binancecoin,ripple,solana,dogecoin";
      const currencies = "usd,eur,gbp";

      const response = await fetch(`${CRYPTO_PRICE_API}?ids=${cryptoIds}&vs_currencies=${currencies}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch prices: ${response.status}`);
      }

      const data = await response.json();

      // Map to our internal format
      this.cryptoPrices = {
        BTC: data.bitcoin.usd,
        ETH: data.ethereum.usd,
        USDT: data.tether.usd,
        BNB: data.binancecoin.usd,
        XRP: data.ripple.usd,
        SOL: data.solana.usd,
        DOGE: data.dogecoin.usd,
      };

      this.lastPriceUpdate = Date.now();

      // Update prices on existing offers
      this.updateOffersWithNewPrices();

      return this.cryptoPrices;
    } catch (error) {
      console.error("Error fetching crypto prices:", error);
      // Fallback to some default prices if API fails
      if (Object.keys(this.cryptoPrices).length === 0) {
        this.cryptoPrices = {
          BTC: 50000,
          ETH: 3000,
          USDT: 1,
          BNB: 500,
          XRP: 0.5,
          SOL: 100,
          DOGE: 0.1
        };
      }
      return this.cryptoPrices;
    }
  }

  private updateOffersWithNewPrices() {
    // Update buy offers
    this.buyOffers = this.buyOffers.map(offer => {
      const basePrice = this.cryptoPrices[offer.crypto] || 0;
      // Add slight premium (1-5%) for buy offers
      const premium = 1 + (Math.random() * 0.04 + 0.01);
      return {
        ...offer,
        price: basePrice * premium,
      };
    });

    // Update sell offers
    this.sellOffers = this.sellOffers.map(offer => {
      const basePrice = this.cryptoPrices[offer.crypto] || 0;
      // Add slight discount (1-3%) for sell offers
      const discount = 1 - (Math.random() * 0.03);
      return {
        ...offer,
        price: basePrice * discount,
      };
    });
  }

  // Method to add a vendor (for admin use)
  public addVendor(
    vendorName: string, 
    cryptos: string[], 
    paymentMethods: string[], 
    rating: number = 5.0,
    completedTrades: number = 0
  ): { name: string, avatar: string, rating: number, completedTrades: number } {
    const vendor = {
      name: vendorName,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(vendorName)}`,
      rating,
      completedTrades
    };

    return vendor;
  }

  // Method to create an offer
  public async createP2POffer(offer: Omit<P2POffer, 'id' | 'createdAt'>): Promise<P2POffer> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Generate ID and add creation date
        const newOffer: P2POffer = {
          ...offer,
          id: `offer-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          createdAt: new Date()
        };

        // Add to appropriate list
        if (offer.user.name === "You") {
          // If current user is posting
          if (offer.price > (this.cryptoPrices[offer.crypto] || 0)) {
            this.buyOffers.push(newOffer);
          } else {
            this.sellOffers.push(newOffer);
          }
        } else {
          // If vendor is posting
          // For simplicity, we'll add vendor offers based on the price
          if (offer.price > (this.cryptoPrices[offer.crypto] || 0)) {
            this.buyOffers.push(newOffer);
          } else {
            this.sellOffers.push(newOffer);
          }
        }

        resolve(newOffer);
      }, 300);
    });
  }

  public getBuyOffers(): Promise<P2POffer[]> {
    // If prices haven't been updated recently, update them
    if (Date.now() - this.lastPriceUpdate > this.priceUpdateInterval) {
      this.updateCryptoPrices();
    }

    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...this.buyOffers]);
      }, 500);
    });
  }

  public getSellOffers(): Promise<P2POffer[]> {
    // If prices haven't been updated recently, update them
    if (Date.now() - this.lastPriceUpdate > this.priceUpdateInterval) {
      this.updateCryptoPrices();
    }

    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...this.sellOffers]);
      }, 500);
    });
  }

  public getUserOrders(): Promise<P2POrder[]> {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...this.userOrders]);
      }, 500);
    });
  }

  public async placeOrder(
    offerId: string, 
    amount: number, 
    type: 'buy' | 'sell'
  ): Promise<P2POrder> {
    // Find the offer
    const offerList = type === 'buy' ? this.buyOffers : this.sellOffers;
    const offer = offerList.find(o => o.id === offerId);

    if (!offer) {
      throw new Error("Offer not found");
    }

    if (amount < offer.limits.min || amount > offer.limits.max) {
      throw new Error(`Amount must be between ${offer.limits.min} and ${offer.limits.max} ${offer.fiatCurrency}`);
    }

    // Calculate crypto amount
    const cryptoAmount = amount / offer.price;

    if (cryptoAmount > offer.availableAmount) {
      throw new Error(`Not enough crypto available. Maximum: ${offer.availableAmount} ${offer.crypto}`);
    }

    // Create new order
    const newOrder: P2POrder = {
      id: `order-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      offerId: offer.id,
      type,
      status: 'pending',
      amount,
      total: cryptoAmount,
      crypto: offer.crypto,
      fiatCurrency: offer.fiatCurrency,
      createdAt: new Date(),
      seller: type === 'buy' ? offer.user.name : 'You',
      buyer: type === 'buy' ? 'You' : offer.user.name,
      paymentMethod: offer.paymentMethods[0]
    };

    // In a real app, you would send this to your backend
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        // Update available amount
        offer.availableAmount -= cryptoAmount;

        // Add to user orders
        this.userOrders.push(newOrder);

        resolve(newOrder);
      }, 1000);
    });
  }

  public async filterOffers(
    type: 'buy' | 'sell',
    filters: {
      crypto?: string;
      fiat?: string;
      paymentMethod?: string;
      searchQuery?: string;
    }
  ): Promise<P2POffer[]> {
    const offers = type === 'buy' ? this.buyOffers : this.sellOffers;

    // If prices haven't been updated recently, update them
    if (Date.now() - this.lastPriceUpdate > this.priceUpdateInterval) {
      await this.updateCryptoPrices();
    }

    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const filtered = offers.filter(offer => {
          if (filters.crypto && filters.crypto !== 'all' && offer.crypto !== filters.crypto) return false;
          if (filters.fiat && filters.fiat !== 'all' && offer.fiatCurrency !== filters.fiat) return false;
          if (filters.paymentMethod && filters.paymentMethod !== 'all' && 
              !offer.paymentMethods.some(method => method.toLowerCase().includes(filters.paymentMethod!.toLowerCase()))) return false;
          if (filters.searchQuery && !offer.user.name.toLowerCase().includes(filters.searchQuery.toLowerCase())) return false;
          return true;
        });

        resolve(filtered);
      }, 300);
    });
  }

  public async cancelOrder(orderId: string): Promise<boolean> {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const orderIndex = this.userOrders.findIndex(o => o.id === orderId);
        if (orderIndex >= 0) {
          this.userOrders[orderIndex].status = 'cancelled';
          resolve(true);
        } else {
          resolve(false);
        }
      }, 800);
    });
  }

  public async getCurrentPrices(): Promise<Record<string, number>> {
    // If prices haven't been updated recently, update them
    if (Date.now() - this.lastPriceUpdate > this.priceUpdateInterval) {
      await this.updateCryptoPrices();
    }

    return this.cryptoPrices;
  }
}

export const p2pService = new P2PService();

export default p2pService;