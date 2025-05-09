
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
      
      // Generate initial offers with real prices
      this.generateDynamicOffers();
      
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
  
  private generateDynamicOffers() {
    const traders = [
      {
        name: "CryptoMaster",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=CryptoMaster",
        rating: 4.9,
        completedTrades: 386
      },
      {
        name: "AfricaTrader",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=AfricaTrader",
        rating: 4.7,
        completedTrades: 125
      },
      {
        name: "BlockchainBaron",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=BlockchainBaron",
        rating: 4.9,
        completedTrades: 412
      },
      {
        name: "CryptoQueen",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=CryptoQueen",
        rating: 4.8,
        completedTrades: 273
      },
      {
        name: "BitcoinWhale",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=BitcoinWhale",
        rating: 5.0,
        completedTrades: 531
      },
      {
        name: "NairobiTrader",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=NairobiTrader",
        rating: 4.6,
        completedTrades: 98
      },
      {
        name: "LagosExchange",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=LagosExchange",
        rating: 4.5,
        completedTrades: 147
      },
      {
        name: "AccraFinance",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=AccraFinance",
        rating: 4.4,
        completedTrades: 82
      }
    ];
    
    const paymentMethodGroups = [
      ["Bank Transfer"],
      ["M-PESA"],
      ["PayPal"],
      ["Bank Transfer", "PayPal"],
      ["Mobile Money"],
      ["Cash in Person"],
      ["M-PESA", "Mobile Money"],
      ["Credit/Debit Card"]
    ];
    
    const terms = [
      "Payment must be completed within 15 minutes. Please include transaction reference.",
      "Please make payment promptly. I will release crypto immediately after confirmation.",
      "M-PESA transactions will be processed immediately. I'm available 24/7.",
      "Serious buyers only. Payment must be made within time limit.",
      "Release after payment confirmation. I usually respond within 5 minutes.",
      "Include transaction ID in the memo. Fast release after confirmation.",
      "Please send screenshot of payment for faster processing.",
      "Only send from account with matching name. No third-party transfers."
    ];
    
    // Generate buy offers
    this.buyOffers = [];
    Object.keys(this.cryptoPrices).forEach((crypto, i) => {
      // Generate 1-3 offers per crypto
      const numOffers = Math.floor(Math.random() * 3) + 1;
      
      for (let j = 0; j < numOffers; j++) {
        const basePrice = this.cryptoPrices[crypto] || 0;
        const premium = 1 + (Math.random() * 0.04 + 0.01); // 1-5% premium
        const price = basePrice * premium;
        
        const traderIndex = (i + j) % traders.length;
        const methodIndex = (i + j) % paymentMethodGroups.length;
        const termIndex = (i + j) % terms.length;
        
        // Calculate appropriate limits based on price
        let minLimit = 50;
        let maxLimit = 5000;
        
        if (crypto === 'BTC' || crypto === 'ETH') {
          minLimit = 100;
          maxLimit = 10000;
        } else if (crypto === 'USDT') {
          minLimit = 100;
          maxLimit = 20000;
        }
        
        // Calculate available amount
        const availableAmount = (Math.random() * 2 + 0.1).toFixed(6);
        
        this.buyOffers.push({
          id: `buy-${crypto}-${Date.now()}-${j}`,
          user: traders[traderIndex],
          crypto,
          price,
          fiatCurrency: "USD",
          paymentMethods: paymentMethodGroups[methodIndex],
          limits: {
            min: minLimit,
            max: maxLimit
          },
          availableAmount: parseFloat(availableAmount),
          terms: terms[termIndex],
          createdAt: new Date(Date.now() - Math.random() * 86400000)
        });
      }
    });
    
    // Generate sell offers
    this.sellOffers = [];
    Object.keys(this.cryptoPrices).forEach((crypto, i) => {
      // Generate 1-2 offers per crypto
      const numOffers = Math.floor(Math.random() * 2) + 1;
      
      for (let j = 0; j < numOffers; j++) {
        const basePrice = this.cryptoPrices[crypto] || 0;
        const discount = 1 - (Math.random() * 0.03); // 0-3% discount
        const price = basePrice * discount;
        
        const traderIndex = (i + j + 3) % traders.length;
        const methodIndex = (i + j + 2) % paymentMethodGroups.length;
        const termIndex = (i + j + 4) % terms.length;
        
        // Calculate appropriate limits based on price
        let minLimit = 50;
        let maxLimit = 5000;
        
        if (crypto === 'BTC' || crypto === 'ETH') {
          minLimit = 200;
          maxLimit = 15000;
        } else if (crypto === 'USDT') {
          minLimit = 100;
          maxLimit = 25000;
        }
        
        // Calculate available amount
        const availableAmount = (Math.random() * 3 + 0.5).toFixed(6);
        
        this.sellOffers.push({
          id: `sell-${crypto}-${Date.now()}-${j}`,
          user: traders[traderIndex],
          crypto,
          price,
          fiatCurrency: "USD",
          paymentMethods: paymentMethodGroups[methodIndex],
          limits: {
            min: minLimit,
            max: maxLimit
          },
          availableAmount: parseFloat(availableAmount),
          terms: terms[termIndex],
          createdAt: new Date(Date.now() - Math.random() * 86400000)
        });
      }
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
  
  public async createP2POffer(offerData: Omit<P2POffer, 'id' | 'createdAt'>): Promise<P2POffer> {
    // In a real app, you would send this to your backend
    const newOffer: P2POffer = {
      ...offerData,
      id: `offer-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date()
    };
    
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        if (Math.random() > 0.2) { // 80% success rate
          // Add to appropriate list
          if (offerData.user.name === "You") {
            // Add to buy or sell list based on user's role in the offer
            // For simplicity, randomly assign
            const isBuyOffer = Math.random() > 0.5;
            if (isBuyOffer) {
              this.buyOffers.push(newOffer);
            } else {
              this.sellOffers.push(newOffer);
            }
          }
          resolve(newOffer);
        } else {
          throw new Error("Failed to create offer. Please try again.");
        }
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
