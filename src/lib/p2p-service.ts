
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

// This would connect to your backend in a real implementation
class P2PService {
  private buyOffers: P2POffer[] = [];
  private sellOffers: P2POffer[] = [];
  private userOrders: P2POrder[] = [];
  
  constructor() {
    // Initialize with some data
    this.loadInitialData();
  }
  
  private loadInitialData() {
    // This would be fetched from your backend in a real implementation
    this.buyOffers = [
      {
        id: "1",
        user: {
          name: "CryptoMaster",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=CryptoMaster",
          rating: 4.9,
          completedTrades: 386
        },
        crypto: "BTC",
        price: 55432.87,
        fiatCurrency: "USD",
        paymentMethods: ["Bank Transfer", "PayPal"],
        limits: {
          min: 100,
          max: 10000
        },
        availableAmount: 0.85,
        terms: "Payment must be completed within 15 minutes. Please include transaction reference.",
        createdAt: new Date(Date.now() - 86400000) // 1 day ago
      },
      {
        id: "2",
        user: {
          name: "AfricaTrader",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=AfricaTrader",
          rating: 4.7,
          completedTrades: 125
        },
        crypto: "BTC",
        price: 55510.50,
        fiatCurrency: "USD",
        paymentMethods: ["M-PESA", "Mobile Money"],
        limits: {
          min: 50,
          max: 5000
        },
        availableAmount: 0.42,
        terms: "M-PESA transactions will be processed immediately. I'm available 24/7.",
        createdAt: new Date(Date.now() - 60000) // 1 hour ago
      }
    ];
    
    this.sellOffers = [
      {
        id: "5",
        user: {
          name: "BlockchainBaron",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=BlockchainBaron",
          rating: 4.9,
          completedTrades: 412
        },
        crypto: "BTC",
        price: 55600.11,
        fiatCurrency: "USD",
        paymentMethods: ["Bank Transfer"],
        limits: {
          min: 200,
          max: 15000
        },
        availableAmount: 1.5,
        terms: "Release after payment confirmation. I usually respond within 5 minutes.",
        createdAt: new Date(Date.now() - 43200000) // 12 hours ago
      }
    ];
  }
  
  public getBuyOffers(): Promise<P2POffer[]> {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...this.buyOffers]);
      }, 500);
    });
  }
  
  public getSellOffers(): Promise<P2POffer[]> {
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
          if (Math.random() > 0.5) {
            this.buyOffers.push(newOffer);
          } else {
            this.sellOffers.push(newOffer);
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
}

export const p2pService = new P2PService();

export default p2pService;
