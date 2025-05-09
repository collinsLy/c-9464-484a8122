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
    orderCount?: number;
    completionRate?: number;
    responseTime?: number; // in minutes
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
  paymentDetails?: {
    bankName?: string;
    accountNumber?: string;
    accountHolderName?: string;
    swiftCode?: string;
    branchCode?: string;
    paypalEmail?: string;
    paypalName?: string;
    mobileNumber?: string;
    mpesaName?: string;
    mobileProvider?: string;
    otherProvider?: string;
    accountName?: string;
    meetingLocation?: string;
    contactNumber?: string;
    preferredTime?: string;
    instructions?: string;
    [key: string]: any;
  };
  type?: 'buy' | 'sell'; // To track if it's a buy or sell offer
  advertisersTerms?: string; // Additional terms specifically from advertiser
  userId?: string; // Firebase user ID of the offer creator
}

export interface P2POrder {
  id: string;
  referenceNumber?: string; // Reference number for payment
  offerId: string;
  type: 'buy' | 'sell';
  status: 'pending' | 'awaiting_release' | 'completed' | 'cancelled' | 'dispute_opened' | 'refunded';
  amount: number;
  total: number;
  crypto: string;
  fiatCurrency: string;
  createdAt: Date;
  updatedAt?: Date; // Track status change times
  seller: string;
  buyer: string;
  paymentMethod: string;
  paymentWindow?: number; // Time in minutes to complete payment
  paymentDeadline?: Date; // Calculated deadline for payment
  paymentDetails?: {
    bankName?: string;
    accountNumber?: string;
    accountHolderName?: string;
    swiftCode?: string;
    branchCode?: string;
    paypalEmail?: string;
    paypalName?: string;
    mobileNumber?: string;
    mpesaName?: string;
    mobileProvider?: string;
    otherProvider?: string;
    accountName?: string;
    meetingLocation?: string;
    contactNumber?: string;
    preferredTime?: string;
    instructions?: string;
  };
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
        createdAt: new Date(),
        user: {
          ...offer.user,
          orderCount: offer.user.orderCount || Math.floor(Math.random() * 2000) + 100,
          completionRate: offer.user.completionRate || (99 + Math.random()),
          responseTime: offer.user.responseTime || 15
        }
      };

      // Get current price for reference
      const currentPrice = this.cryptoPrices[offer.crypto] || 0;

      console.log(`Creating offer: ${offer.user.name} wants to trade ${offer.crypto} at price ${offer.price}, current market price: ${currentPrice}`);
      
      // Log payment details for debugging
      console.log("Payment details being saved:", offer.paymentDetails);

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
        userId: auth.currentUser.uid, // Track who created the offer
        // Ensure payment details are explicitly included
        paymentDetails: newOffer.paymentDetails || {}
      };

      // Debug: log what's being sent to Firebase
      console.log("Saving offer to Firebase with payment details:", JSON.stringify(offerData.paymentDetails));

      try {
        // Use setDoc with a custom document ID to ensure ID consistency
        const docRef = doc(collection(db, this.OFFERS_COLLECTION), newOffer.id);
        await setDoc(docRef, offerData);
        console.log(`Offer saved to Firebase: ${newOffer.id} with payment details:`, 
                    Object.keys(offerData.paymentDetails || {}).length > 0 ? "Yes" : "No");
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
          user: data.user || { name: "Anonymous", avatar: "", rating: 0, completedTrades: 0 },
          userId: data.userId // Include the userId of who created the offer
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
          user: data.user || { name: "Anonymous", avatar: "", rating: 0, completedTrades: 0 },
          userId: data.userId // Include the userId of who created the offer
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

      // Query Firebase for orders where user is the direct creator
      const buyerOrdersQuery = query(
        collection(db, this.ORDERS_COLLECTION),
        where("userId", "==", userId)
      );

      // Query Firebase for orders where user is the offer owner
      const sellerOrdersQuery = query(
        collection(db, this.ORDERS_COLLECTION),
        where("offerOwnerId", "==", userId)
      );

      // Get both sets of orders
      const [buyerSnapshot, sellerSnapshot] = await Promise.all([
        getDocs(buyerOrdersQuery),
        getDocs(sellerOrdersQuery)
      ]);

      // Process buyer orders
      const buyerOrders: P2POrder[] = buyerSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: data.id || doc.id,
          createdAt: new Date(data.createdAt),
          paymentDeadline: data.paymentDeadline ? new Date(data.paymentDeadline) : undefined
        } as P2POrder;
      });

      // Process seller orders
      const sellerOrders: P2POrder[] = sellerSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: data.id || doc.id,
          createdAt: new Date(data.createdAt),
          paymentDeadline: data.paymentDeadline ? new Date(data.paymentDeadline) : undefined
        } as P2POrder;
      });

      // Combine and deduplicate orders
      const combinedOrders = [...buyerOrders];
      
      // Add seller orders that aren't already in the buyer orders
      sellerOrders.forEach(sellerOrder => {
        if (!combinedOrders.some(order => order.id === sellerOrder.id)) {
          combinedOrders.push(sellerOrder);
        }
      });

      // Sort orders by creation date (newest first)
      combinedOrders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      // Log for debugging
      console.log(`Found ${buyerOrders.length} buyer orders and ${sellerOrders.length} seller orders for user ${userId}`);

      // Update local cache
      this.userOrders = combinedOrders;

      return combinedOrders;
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

      // Add a small tolerance (0.1%) to handle floating point precision issues
      const tolerance = 1.001; // Allow 0.1% tolerance
      if (cryptoAmount * tolerance > offer.availableAmount) {
        // Format the available amount to a fixed number of decimal places for better readability
        const formattedAvailable = offer.availableAmount.toFixed(6);
        
        // Calculate max fiat amount user can input based on available crypto
        const maxFiatAmount = (offer.availableAmount * offer.price).toFixed(2);
        
        throw new Error(`Not enough crypto available. Maximum: ${formattedAvailable} ${offer.crypto} (approximately ${maxFiatAmount} ${offer.fiatCurrency})`);
      }
      
      // Use a slightly smaller amount to avoid rounding errors
      const safeCryptoAmount = Math.min(cryptoAmount * 0.999, offer.availableAmount);

      // Generate a random reference number for payment
      const referenceNumber = Math.floor(Math.random() * 10000000000000000000).toString().padStart(20, '0');

      // Default payment window (15 min)
      const paymentWindow = 15;
      const paymentDeadline = new Date(Date.now() + (paymentWindow * 60 * 1000));

      // Log payment details before creating order
      console.log("Original offer payment details:", offer.paymentDetails);

      // Create new order
      const newOrder: P2POrder = {
        id: `order-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        referenceNumber,
        offerId: offer.id,
        type,
        status: 'pending',
        amount,
        total: safeCryptoAmount, // Use the safety buffer amount to avoid rounding errors
        crypto: offer.crypto,
        fiatCurrency: offer.fiatCurrency,
        createdAt: new Date(),
        seller: type === 'buy' ? offer.user.name : 'You',
        buyer: type === 'buy' ? 'You' : offer.user.name,
        paymentMethod: offer.paymentMethods[0],
        paymentWindow,
        paymentDeadline,
        // If buying, use the seller's payment details, otherwise empty (buyer will provide details)
        paymentDetails: type === 'buy' ? { ...(offer.paymentDetails || {}) } : {}
      };

      // Update available amount in the offer
      offer.availableAmount -= safeCryptoAmount;

      // Add to user orders
      this.userOrders.push(newOrder);

      // Log order before saving to Firebase
      console.log("Saving order with payment details:", newOrder.paymentDetails);

      // Save order to Firebase
      const orderData = {
        ...newOrder,
        createdAt: newOrder.createdAt.toISOString(),
        paymentDeadline: paymentDeadline.toISOString(),
        userId: auth.currentUser?.uid || 'anonymous',
        // Store the offer owner's ID to send them notifications
        offerOwnerId: offer.userId,
        // Ensure payment details are explicitly included
        paymentDetails: newOrder.paymentDetails || {}
      };

      const orderRef = await addDoc(collection(db, this.ORDERS_COLLECTION), orderData);

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
        
        // Send notification to offer owner if they're not the current user
        if (offer.userId && offer.userId !== auth.currentUser?.uid) {
          // Create a notification in the database
          await this.createOfferNotification(
            offer.userId, 
            offer.id, 
            newOrder.id, 
            type, 
            amount, 
            offer.crypto,
            offer.fiatCurrency
          );
          
          // Play notification sound to indicate new order
          try {
            // Import dynamically to avoid circular dependency
            const { NotificationService } = await import('./notification-service');
            NotificationService.playSound('payment_success');
          } catch (error) {
            console.error("Error playing notification sound:", error);
          }
        }
      }

      return newOrder;
    } catch (error) {
      console.error("Error placing P2P order:", error);
      throw error;
    }
  }
  
  // Add a method to create notifications for offer owners
  public readonly NOTIFICATIONS_COLLECTION = "p2pNotifications";
  
  public async createOfferNotification(
    userId: string,
    offerId: string,
    orderId: string,
    orderType: 'buy' | 'sell',
    amount: number,
    crypto: string,
    fiatCurrency: string
  ): Promise<boolean> {
    try {
      if (!userId) {
        console.error("Cannot create notification: Missing user ID");
        return false;
      }
      
      console.log(`Creating notification for user ${userId} about order ${orderId}`);
      
      // Create a notification document in Firestore with detailed information
      const notification = {
        userId,
        offerId,
        orderId,
        type: 'new_order',
        message: `Someone is interested in your ${orderType === 'buy' ? 'sell' : 'buy'} offer! New order for ${amount} ${fiatCurrency} (${(amount / this.cryptoPrices[crypto] || 1).toFixed(6)} ${crypto})`,
        read: false,
        createdAt: new Date().toISOString(),
        senderId: auth.currentUser?.uid || 'anonymous',
        cryptoAmount: (amount / this.cryptoPrices[crypto] || 1).toFixed(8),
        cryptoSymbol: crypto,
        fiatAmount: amount,
        fiatCurrency: fiatCurrency
      };
      
      // Log the notification data being saved
      console.log("Saving notification with data:", JSON.stringify(notification));
      
      // Add the notification to the Firestore collection
      try {
        const docRef = await addDoc(collection(db, this.NOTIFICATIONS_COLLECTION), notification);
        console.log(`Notification created for user ${userId} about order ${orderId}, doc ID: ${docRef.id}`);
      } catch (dbError) {
        console.error("Firestore error creating notification:", dbError);
        // Try without detailed data if it's causing an issue
        const simpleNotification = {
          userId,
          type: 'new_order',
          message: `New P2P order notification`,
          read: false,
          createdAt: new Date().toISOString()
        };
        
        await addDoc(collection(db, this.NOTIFICATIONS_COLLECTION), simpleNotification);
        console.log("Created simplified notification as fallback");
      }
      
      // Try to play a notification sound
      try {
        // Try to use browser Audio API directly for immediate feedback
        const audio = new Audio('/sounds/alert.mp3');
        audio.volume = 0.3;
        await audio.play().catch(e => console.error("Browser audio API error:", e));
        
        // Also try the notification service for completeness
        const { NotificationService } = await import('./notification-service');
        NotificationService.playSound('alert');
      } catch (soundError) {
        console.error("Error playing notification sound:", soundError);
      }
      
      return true;
    } catch (error) {
      console.error("Error creating offer notification:", error);
      // Log more details about the error for debugging
      if (error instanceof Error) {
        console.error("Error details:", error.message, error.stack);
      }
      return false;
    }
  }
  
  // Method to get user's notifications
  public async getUserNotifications(): Promise<any[]> {
    try {
      if (!auth.currentUser?.uid) {
        console.log("No authenticated user found for notifications");
        return [];
      }
      
      console.log("Fetching notifications for user:", auth.currentUser.uid);
      
      // Create a query to get all notifications for the current user
      const notificationsQuery = query(
        collection(db, this.NOTIFICATIONS_COLLECTION),
        where("userId", "==", auth.currentUser.uid)
      );
      
      const snapshot = await getDocs(notificationsQuery);
      console.log(`Found ${snapshot.docs.length} notifications`);
      
      // Convert documents to notification objects
      const notifications = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Ensure createdAt is properly formatted
          createdAt: data.createdAt || new Date().toISOString()
        };
      });
      
      // Sort notifications by creation date (newest first)
      notifications.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });
      
      // Play a sound if there are unread notifications
      const hasUnread = notifications.some(notification => !notification.read);
      if (hasUnread) {
        try {
          const audio = new Audio('/sounds/alert.mp3');
          audio.volume = 0.2;
          audio.play().catch(e => console.error("Error playing notification sound:", e));
        } catch (soundError) {
          console.error("Error playing notification sound:", soundError);
        }
      }
      
      return notifications;
    } catch (error) {
      console.error("Error fetching user notifications:", error);
      // Log detailed error for debugging
      if (error instanceof Error) {
        console.error("Error details:", error.message, error.stack);
      }
      
      return [];
    }
  }
  
  // Mark a notification as read
  public async markNotificationAsRead(notificationId: string): Promise<boolean> {
    try {
      const notificationRef = doc(db, this.NOTIFICATIONS_COLLECTION, notificationId);
      await updateDoc(notificationRef, {
        read: true
      });
      return true;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return false;
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
  
  public async updateOrderStatus(
    orderId: string, 
    status: 'pending' | 'awaiting_release' | 'completed' | 'cancelled' | 'dispute_opened' | 'refunded'
  ): Promise<boolean> {
    try {
      // Find the order in Firebase
      const ordersQuery = query(
        collection(db, this.ORDERS_COLLECTION),
        where("id", "==", orderId)
      );

      const snapshot = await getDocs(ordersQuery);

      if (snapshot.empty) {
        throw new Error("Order not found");
      }

      // Update the order status in Firebase
      const orderDoc = snapshot.docs[0];
      const orderData = orderDoc.data();
      
      // Validate status transition
      if (
        (orderData.status === 'completed' && status !== 'dispute_opened') ||
        (orderData.status === 'cancelled' && status !== 'dispute_opened') ||
        (orderData.status === 'refunded') ||
        // Only allow pending → awaiting_release → completed (or dispute)
        (orderData.status === 'pending' && status !== 'awaiting_release' && status !== 'cancelled' && status !== 'dispute_opened') ||
        (orderData.status === 'awaiting_release' && status !== 'completed' && status !== 'cancelled' && status !== 'dispute_opened')
      ) {
        throw new Error(`Invalid status transition from ${orderData.status} to ${status}`);
      }
      
      // Handle escrow management based on status transitions
      // In a real implementation, this would interact with a wallet/balance system
      if (status === 'completed' && orderData.status === 'awaiting_release') {
        // Transfer crypto from escrow to buyer
        console.log(`Releasing ${orderData.total} ${orderData.crypto} from escrow to buyer`);
        
        // Here you would call your wallet service to move funds
        // await walletService.releaseFromEscrow(orderId, orderData.total, orderData.crypto);
        
        // Add a system chat message about completion
        await this.addChatMessage(
          orderId,
          'System',
          'The seller has released the funds. Transaction completed successfully.',
          new Date()
        );
      }
      
      // If transitioning to cancelled from awaiting_release, return funds to seller
      if (status === 'cancelled' && orderData.status === 'awaiting_release') {
        console.log(`Returning ${orderData.total} ${orderData.crypto} from escrow to seller`);
        
        // Here you would call your wallet service
        // await walletService.returnFromEscrow(orderId, orderData.total, orderData.crypto);
        
        // Add a system chat message about cancellation
        await this.addChatMessage(
          orderId,
          'System',
          'The order has been cancelled. Any escrowed funds have been returned to the seller.',
          new Date()
        );
      }

      // Add a system message when payment is marked as sent
      if (status === 'awaiting_release' && orderData.status === 'pending') {
        await this.addChatMessage(
          orderId,
          'System',
          'Buyer has marked payment as sent. Seller should verify payment and release the crypto.',
          new Date()
        );
      }

      await updateDoc(doc(db, this.ORDERS_COLLECTION, orderDoc.id), {
        status,
        updatedAt: new Date().toISOString()
      });

      // Update the order in local cache
      const orderIndex = this.userOrders.findIndex(o => o.id === orderId);
      if (orderIndex >= 0) {
        this.userOrders[orderIndex].status = status;
      }

      return true;
    } catch (error) {
      console.error(`Error updating order status to ${status}:`, error);
      throw error;
    }
  }
  
  // Chat message management
  private readonly CHAT_MESSAGES_COLLECTION = "p2pChatMessages";
  
  public async getChatMessages(orderId: string): Promise<{sender: string, text: string, timestamp: Date}[]> {
    try {
      // Create a query ordered by timestamp to ensure messages are in correct sequence
      const messagesQuery = query(
        collection(db, this.CHAT_MESSAGES_COLLECTION),
        where("orderId", "==", orderId),
        orderBy("timestamp", "asc")
      );
      
      const snapshot = await getDocs(messagesQuery);
      
      // Convert timestamps and format messages
      const formattedMessages = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id, // Include message ID for potential future operations
          sender: data.sender,
          text: data.text,
          timestamp: new Date(data.timestamp)
        };
      });
      
      return formattedMessages;
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      return [];
    }
  }
  
  // Subscribe to chat messages in real-time (not yet fully integrated, but ready for future)
  public subscribeToChatMessages(
    orderId: string, 
    callback: (messages: {sender: string, text: string, timestamp: Date}[]) => void
  ): () => void {
    try {
      // Create a query for this order's messages
      const messagesQuery = query(
        collection(db, this.CHAT_MESSAGES_COLLECTION),
        where("orderId", "==", orderId),
        orderBy("timestamp", "asc")
      );
      
      // Set up real-time listener
      const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        const messages = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            sender: data.sender,
            text: data.text,
            timestamp: new Date(data.timestamp)
          };
        });
        
        // Call the callback with the updated messages
        callback(messages);
      });
      
      // Return the unsubscribe function so it can be called when no longer needed
      return unsubscribe;
    } catch (error) {
      console.error("Error subscribing to chat messages:", error);
      return () => {}; // Return empty function as fallback
    }
  }
  
  public async addChatMessage(
    orderId: string, 
    sender: string, 
    text: string, 
    timestamp: Date = new Date()
  ): Promise<boolean> {
    try {
      // Ensure the order exists
      const ordersQuery = query(
        collection(db, this.ORDERS_COLLECTION),
        where("id", "==", orderId)
      );
      
      const orderSnapshot = await getDocs(ordersQuery);
      
      if (orderSnapshot.empty) {
        throw new Error("Order not found");
      }
      
      // Add the chat message
      await addDoc(collection(db, this.CHAT_MESSAGES_COLLECTION), {
        orderId,
        sender,
        text,
        timestamp: timestamp.toISOString(),
        userId: auth.currentUser?.uid || 'anonymous'
      });
      
      return true;
    } catch (error) {
      console.error("Error adding chat message:", error);
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

  public async updateP2POffer(offerId: string, updatedData: P2POffer): Promise<boolean> {
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

      // Convert Date object to string for Firestore
      const firestoreData = {
        ...updatedData,
        createdAt: updatedData.createdAt.toISOString()
      };

      // Update the offer in Firebase
      await updateDoc(doc(db, this.OFFERS_COLLECTION, offerDoc.id), firestoreData);

      // Update the offers in memory
      const offerType = offerData.type || 'buy';

      if (offerType === 'buy') {
        const index = this.buyOffers.findIndex(o => o.id === offerId);
        if (index >= 0) {
          this.buyOffers[index] = updatedData;
        }
      } else {
        const index = this.sellOffers.findIndex(o => o.id === offerId);
        if (index >= 0) {
          this.sellOffers[index] = updatedData;
        }
      }

      return true;
    } catch (error) {
      console.error("Error updating P2P offer:", error);
      throw error;
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
  
  // For handling payment confirmation
  public async confirmPayment(orderId: string): Promise<boolean> {
    try {
      return await this.updateOrderStatus(orderId, 'awaiting_release');
    } catch (error) {
      console.error("Error confirming payment:", error);
      throw error;
    }
  }
  
  // For handling crypto release
  public async releaseCrypto(orderId: string): Promise<boolean> {
    try {
      return await this.updateOrderStatus(orderId, 'completed');
    } catch (error) {
      console.error("Error releasing crypto:", error);
      throw error;
    }
  }
  
  // For handling payment windows
  public async getPaymentTimeLeft(orderId: string): Promise<number> {
    try {
      // Find the order
      const order = this.userOrders.find(o => o.id === orderId);
      if (!order || !order.paymentDeadline) {
        return 0;
      }
      
      const now = new Date();
      const deadline = new Date(order.paymentDeadline);
      const timeLeft = Math.max(0, Math.floor((deadline.getTime() - now.getTime()) / 1000));
      
      return timeLeft;
    } catch (error) {
      console.error("Error getting payment time left:", error);
      return 0;
    }
  }
  
  // For handling dispute creation
  public async createDispute(orderId: string, reason: string): Promise<boolean> {
    try {
      // Find the order in Firebase
      const ordersQuery = query(
        collection(db, this.ORDERS_COLLECTION),
        where("id", "==", orderId)
      );

      const snapshot = await getDocs(ordersQuery);

      if (snapshot.empty) {
        throw new Error("Order not found");
      }

      // Update the order status in Firebase
      const orderDoc = snapshot.docs[0];
      await updateDoc(doc(db, this.ORDERS_COLLECTION, orderDoc.id), {
        status: 'dispute_opened',
        disputeReason: reason,
        disputeCreatedAt: new Date().toISOString()
      });

      // Update the order in local cache
      const orderIndex = this.userOrders.findIndex(o => o.id === orderId);
      if (orderIndex >= 0) {
        this.userOrders[orderIndex].status = 'dispute_opened';
      }

      return true;
    } catch (error) {
      console.error("Error creating dispute:", error);
      throw error;
    }
  }
}

export const p2pService = new P2PService();

export default p2pService;