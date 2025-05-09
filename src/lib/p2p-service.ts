import { toast } from "sonner";
import { db } from "./firebase";
import { collection, addDoc, getDocs, query, where, updateDoc, doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { auth } from './firebase';

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
  private readonly OFFERS_COLLECTION = "p2pOffers";
  private readonly ORDERS_COLLECTION = "p2pOrders";

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
    try {
      // Check authentication status first
      if (!auth.currentUser) {
        throw new Error("You must be logged in to create an offer. Please sign in and try again.");
      }
      
      // Generate ID and add creation date
      const newOffer: P2POffer = {
        ...offer,
        id: `offer-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        createdAt: new Date()
      };

      // Get current price for reference
      const currentPrice = this.cryptoPrices[offer.crypto] || 0;
      
      console.log(`Creating offer: ${offer.user.name} wants to trade ${offer.crypto} at price ${offer.price}, current market price: ${currentPrice}`);
      
      // Determine if it's a buy or sell offer
      const offerType = offer.price > currentPrice ? 'buy' : 'sell';
      
      // Add to memory for immediate use
      if (offerType === 'buy') {
        this.buyOffers.push(newOffer);
      } else {
        this.sellOffers.push(newOffer);
      }

      // Save to Firebase
      const offerData = {
        ...newOffer,
        type: offerType,
        createdAt: newOffer.createdAt.toISOString(), // Convert Date to string for Firestore
        userId: auth.currentUser.uid // Track who created the offer
      };
      
      try {
        await addDoc(collection(db, this.OFFERS_COLLECTION), offerData);
        console.log(`Offer saved to Firebase: ${newOffer.id}`);
      } catch (error) {
        console.error("Firebase error creating offer:", error);
        // Remove from memory since Firebase save failed
        if (offerType === 'buy') {
          this.buyOffers = this.buyOffers.filter(o => o.id !== newOffer.id);
        } else {
          this.sellOffers = this.sellOffers.filter(o => o.id !== newOffer.id);
        }
        throw error;
      }
      
      return newOffer;
    } catch (error) {
      console.error("Error creating P2P offer:", error);
      throw error;
    }
  }

  public async getBuyOffers(): Promise<P2POffer[]> {
    // If prices haven't been updated recently, update them
    if (Date.now() - this.lastPriceUpdate > this.priceUpdateInterval) {
      await this.updateCryptoPrices();
    }

    try {
      // Query Firebase for buy offers
      const offersQuery = query(
        collection(db, this.OFFERS_COLLECTION), 
        where("type", "==", "buy")
      );
      
      const snapshot = await getDocs(offersQuery);
      
      // Convert Firestore documents to P2POffer objects
      const offers: P2POffer[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: data.id || doc.id,
          createdAt: new Date(data.createdAt), // Convert string back to Date
          user: data.user || { name: "Anonymous", avatar: "", rating: 0, completedTrades: 0 }
        } as P2POffer;
      });
      
      // Update the local cache
      this.buyOffers = offers;
      
      return offers;
    } catch (error) {
      console.error("Error fetching buy offers:", error);
      // Fall back to local cache if Firebase query fails
      return [...this.buyOffers];
    }
  }

  public async getSellOffers(): Promise<P2POffer[]> {
    // If prices haven't been updated recently, update them
    if (Date.now() - this.lastPriceUpdate > this.priceUpdateInterval) {
      await this.updateCryptoPrices();
    }

    try {
      // Query Firebase for sell offers
      const offersQuery = query(
        collection(db, this.OFFERS_COLLECTION), 
        where("type", "==", "sell")
      );
      
      const snapshot = await getDocs(offersQuery);
      
      // Convert Firestore documents to P2POffer objects
      const offers: P2POffer[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: data.id || doc.id,
          createdAt: new Date(data.createdAt), // Convert string back to Date
          user: data.user || { name: "Anonymous", avatar: "", rating: 0, completedTrades: 0 }
        } as P2POffer;
      });
      
      // Update the local cache
      this.sellOffers = offers;
      
      return offers;
    } catch (error) {
      console.error("Error fetching sell offers:", error);
      // Fall back to local cache if Firebase query fails
      return [...this.sellOffers];
    }
  }

  public async getUserOrders(): Promise<P2POrder[]> {
    try {
      const userId = auth.currentUser?.uid || 'anonymous';
      
      // Query Firebase for user's orders
      const ordersQuery = query(
        collection(db, this.ORDERS_COLLECTION),
        where("userId", "==", userId)
      );
      
      const snapshot = await getDocs(ordersQuery);
      
      // Convert Firestore documents to P2POrder objects
      const orders: P2POrder[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: data.id || doc.id,
          createdAt: new Date(data.createdAt) // Convert string back to Date
        } as P2POrder;
      });
      
      // Update local cache
      this.userOrders = orders;
      
      return orders;
    } catch (error) {
      console.error("Error fetching user orders:", error);
      // Fall back to local cache if Firebase query fails
      return [...this.userOrders];
    }
  }

  public async placeOrder(
    offerId: string, 
    amount: number, 
    type: 'buy' | 'sell'
  ): Promise<P2POrder> {
    try {
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

      // Update available amount in the offer
      offer.availableAmount -= cryptoAmount;

      // Add to user orders
      this.userOrders.push(newOrder);
      
      // Save order to Firebase
      const orderData = {
        ...newOrder,
        createdAt: newOrder.createdAt.toISOString(),
        userId: auth.currentUser?.uid || 'anonymous'
      };
      
      await addDoc(collection(db, this.ORDERS_COLLECTION), orderData);
      
      // Update the offer's available amount in Firebase
      // First find the offer document
      const offersQuery = query(
        collection(db, this.OFFERS_COLLECTION),
        where("id", "==", offerId)
      );
      
      const snapshot = await getDocs(offersQuery);
      if (!snapshot.empty) {
        const offerDoc = snapshot.docs[0];
        await updateDoc(doc(db, this.OFFERS_COLLECTION, offerDoc.id), {
          availableAmount: offer.availableAmount
        });
      }
      
      return newOrder;
    } catch (error) {
      console.error("Error placing P2P order:", error);
      throw error;
    }
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
    try {
      // If prices haven't been updated recently, update them
      if (Date.now() - this.lastPriceUpdate > this.priceUpdateInterval) {
        await this.updateCryptoPrices();
      }
      
      // First, get all offers of the requested type
      let offers: P2POffer[];
      if (type === 'buy') {
        offers = await this.getBuyOffers();
      } else {
        offers = await this.getSellOffers();
      }
      
      // Then apply filters in memory
      const filtered = offers.filter(offer => {
        if (filters.crypto && filters.crypto !== 'all' && offer.crypto !== filters.crypto) return false;
        if (filters.fiat && filters.fiat !== 'all' && offer.fiatCurrency !== filters.fiat) return false;
        if (filters.paymentMethod && filters.paymentMethod !== 'all' && 
            !offer.paymentMethods.some(method => method.toLowerCase().includes(filters.paymentMethod!.toLowerCase()))) return false;
        if (filters.searchQuery && !offer.user.name.toLowerCase().includes(filters.searchQuery.toLowerCase())) return false;
        return true;
      });
      
      return filtered;
    } catch (error) {
      console.error("Error filtering offers:", error);
      throw error;
    }
  }

  public async cancelOrder(orderId: string): Promise<boolean> {
    try {
      // Find the order in Firebase
      const ordersQuery = query(
        collection(db, this.ORDERS_COLLECTION),
        where("id", "==", orderId)
      );
      
      const snapshot = await getDocs(ordersQuery);
      
      if (snapshot.empty) {
        return false;
      }
      
      // Update the order status in Firebase
      const orderDoc = snapshot.docs[0];
      await updateDoc(doc(db, this.ORDERS_COLLECTION, orderDoc.id), {
        status: 'cancelled'
      });
      
      // Update the order in local cache
      const orderIndex = this.userOrders.findIndex(o => o.id === orderId);
      if (orderIndex >= 0) {
        this.userOrders[orderIndex].status = 'cancelled';
      }
      
      return true;
    } catch (error) {
      console.error("Error cancelling order:", error);
      return false;
    }
  }
  
  public async getUserOffers(): Promise<P2POffer[]> {
    try {
      if (!auth.currentUser) {
        throw new Error("You must be logged in to view your offers");
      }
      
      // Query Firebase for user's offers
      const offersQuery = query(
        collection(db, this.OFFERS_COLLECTION),
        where("userId", "==", auth.currentUser.uid)
      );
      
      const snapshot = await getDocs(offersQuery);
      
      // Convert Firestore documents to P2POffer objects
      const offers: P2POffer[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: data.id || doc.id,
          createdAt: new Date(data.createdAt), // Convert string back to Date
          user: data.user || { name: "Anonymous", avatar: "", rating: 0, completedTrades: 0 }
        } as P2POffer;
      });
      
      return offers;
    } catch (error) {
      console.error("Error fetching user offers:", error);
      return [];
    }
  }
  
  public async editP2POffer(offerId: string, updatedData: Partial<P2POffer>): Promise<boolean> {
    try {
      if (!auth.currentUser) {
        throw new Error("You must be logged in to edit an offer");
      }
      
      // Find the offer in Firebase
      const offersQuery = query(
        collection(db, this.OFFERS_COLLECTION),
        where("id", "==", offerId)
      );
      
      const snapshot = await getDocs(offersQuery);
      
      if (snapshot.empty) {
        throw new Error("Offer not found");
      }
      
      // Check if user is the owner of the offer
      const offerDoc = snapshot.docs[0];
      const offerData = offerDoc.data();
      
      if (offerData.userId !== auth.currentUser.uid) {
        throw new Error("You can only edit your own offers");
      }
      
      // Update the offer in Firebase
      await updateDoc(doc(db, this.OFFERS_COLLECTION, offerDoc.id), {
        ...updatedData,
        user: updatedData.user || offerData.user
      });
      
      // Update the offers in memory
      const offerType = offerData.type || 'buy';
      
      if (offerType === 'buy') {
        const index = this.buyOffers.findIndex(o => o.id === offerId);
        if (index >= 0) {
          this.buyOffers[index] = { ...this.buyOffers[index], ...updatedData };
        }
      } else {
        const index = this.sellOffers.findIndex(o => o.id === offerId);
        if (index >= 0) {
          this.sellOffers[index] = { ...this.sellOffers[index], ...updatedData };
        }
      }
      
      return true;
    } catch (error) {
      console.error("Error editing P2P offer:", error);
      throw error;
    }
  }
  
  public async deleteP2POffer(offerId: string): Promise<boolean> {
    try {
      if (!auth.currentUser) {
        throw new Error("You must be logged in to delete an offer");
      }
      
      // Find the offer in Firebase
      const offersQuery = query(
        collection(db, this.OFFERS_COLLECTION),
        where("id", "==", offerId)
      );
      
      const snapshot = await getDocs(offersQuery);
      
      if (snapshot.empty) {
        throw new Error("Offer not found");
      }
      
      // Check if user is the owner of the offer
      const offerDoc = snapshot.docs[0];
      const offerData = offerDoc.data();
      
      if (offerData.userId !== auth.currentUser.uid) {
        throw new Error("You can only delete your own offers");
      }
      
      // Delete the offer from Firebase
      await deleteDoc(doc(db, this.OFFERS_COLLECTION, offerDoc.id));
      
      // Remove from memory
      this.buyOffers = this.buyOffers.filter(o => o.id !== offerId);
      this.sellOffers = this.sellOffers.filter(o => o.id !== offerId);
      
      return true;
    } catch (error) {
      console.error("Error deleting P2P offer:", error);
      throw error;
    }
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