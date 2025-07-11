import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useDashboardContext } from "@/components/dashboard/DashboardLayout";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Search, Filter, ChevronDown, MessageCircle, ShieldCheck, ArrowUpRight, Star, Clock, CreditCard, Users, DollarSign, ArrowRight, AlertTriangle, CheckCircle2, Loader2, RefreshCw, Copy, CheckCircle, Send } from "lucide-react";
import { toast } from "sonner";
import p2pService, { P2POffer, P2POrder } from "@/lib/p2p-service";
import { auth } from "@/lib/firebase";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { NotificationService } from "@/lib/notification-service";
import { PaymentDetails, formatPaymentDetails } from '@/components/p2p/P2PHelpers';

const P2PPage = () => {
  const { isDemoMode } = useDashboardContext();
  const [activeTab, setActiveTab] = useState("buy");
  const [selectedCrypto, setSelectedCrypto] = useState("all");
  const [selectedFiat, setSelectedFiat] = useState("USD");
  const [selectedPayment, setSelectedPayment] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<P2POffer | null>(null);
  const [buyAmount, setBuyAmount] = useState("");
  const [buyTotal, setBuyTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [offersLoading, setOffersLoading] = useState(false);
  const [buyOffers, setBuyOffers] = useState<P2POffer[]>([]);
  const [sellOffers, setSellOffers] = useState<P2POffer[]>([]);
  const [userOrders, setUserOrders] = useState<P2POrder[]>([]);

  // Ensure P2POrder type includes paymentMethod in p2p-service.ts if it doesn't already
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [processingOrder, setProcessingOrder] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

// Notifications List Component
const NotificationsList = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const hasTriggeredRefreshRef = useRef(false);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true);
        const data = await p2pService.getUserNotifications();
        setNotifications(data);
        
        // Check if there are any unread notifications
        const hasUnread = data.some(notif => !notif.read);
        
        // Only refresh orders once per component mount if unread notifications exist
        // This prevents an infinite refresh loop
        if (hasUnread && !hasTriggeredRefreshRef.current) {
          console.log("Found unread notifications, refreshing orders (one-time)");
          hasTriggeredRefreshRef.current = true;
          
          // Add a small delay to prevent rapid successive calls
          setTimeout(() => {
            loadUserOrders().catch(err => 
              console.error("Error refreshing orders after finding notifications:", err)
            );
          }, 1000);
        }
      } catch (error) {
        console.error("Error loading notifications:", error);
        toast.error("Failed to load notifications");
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  const markAsRead = async (notificationId: string) => {
    try {
      await p2pService.markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? {...notif, read: true} 
            : notif
        )
      );
      toast.success("Notification marked as read");
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleNotificationAction = async (notification: any) => {
    if (notification.orderId) {
      try {
        // Force refresh orders to ensure we have the latest data
        await loadUserOrders();
        
        // Find the corresponding order after refreshing
        const order = userOrders.find(o => o.id === notification.orderId);
        
        if (order) {
          // Open the chat for this order
          openChat(order.id);
        } else {
          // If order is still not found, try direct fetch from Firebase
          console.log("Order not found in cached orders, trying direct fetch...");
          
          // Create a query to get the specific order
          const orderQuery = query(
            collection(db, "p2pOrders"),
            where("id", "==", notification.orderId)
          );
          
          const snapshot = await getDocs(orderQuery);
          if (!snapshot.empty) {
            const orderData = snapshot.docs[0].data();
            console.log("Retrieved order directly:", orderData);
            
            // Force reload all orders
            await loadUserOrders();
            
            // Try opening chat again
            openChat(notification.orderId);
          } else {
            toast.error("Order not found in database. Please refresh the page and try again.");
          }
        }
      } catch (error) {
        console.error("Error handling notification action:", error);
        toast.error("Failed to load order details. Please refresh and try again.");
      }
    }

    // Mark notification as read
    markAsRead(notification.id);
  };

  return (
    <div className="max-h-[400px] overflow-y-auto pr-1">
      {loading ? (
        <div className="flex justify-center items-center h-20">
          <Loader2 className="h-6 w-6 animate-spin text-white/50" />
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`p-3 rounded-md border ${
                notification.read 
                  ? 'bg-background/30 border-white/10' 
                  : 'bg-blue-900/20 border-blue-500/30'
              } hover:bg-background/40 transition-colors cursor-pointer`}
              onClick={() => handleNotificationAction(notification)}
            >
              <div className="flex justify-between items-start">
                <div className="font-medium text-sm flex items-center">
                  {notification.type === 'new_order' && (
                    <MessageCircle className="h-4 w-4 mr-2 text-blue-400" />
                  )}
                  {notification.read ? null : (
                    <span className="h-2 w-2 rounded-full bg-blue-500 mr-2" />
                  )}
                  New P2P Order
                </div>
                <div className="text-xs text-white/50">
                  {new Date(notification.createdAt).toLocaleDateString()} {new Date(notification.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
              <div className="text-sm mt-1">{notification.message}</div>
              <div className="flex justify-end mt-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    markAsRead(notification.id);
                  }}
                >
                  {notification.read ? 'Already Read' : 'Mark as Read'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-white/50">
          <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No notifications yet</p>
          <p className="text-xs mt-1">When someone interacts with your P2P offers, you'll see notifications here</p>
        </div>
      )}
    </div>
  );
};

// Payment Timer Component
const PaymentTimer = ({ deadline, onExpire }: { deadline: Date, onExpire: () => void }) => {
  const [timeLeft, setTimeLeft] = useState<{ minutes: number, seconds: number }>({ minutes: 0, seconds: 0 });
  const [isExpiring, setIsExpiring] = useState(false);
  
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = deadline.getTime() - now.getTime();
      
      if (difference <= 0) {
        return { minutes: 0, seconds: 0 };
      }
      
      const minutes = Math.floor(difference / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      // Trigger warning when less than 2 minutes remain
      if (minutes < 2 && !isExpiring) {
        setIsExpiring(true);
        onExpire();
      }
      
      return { minutes, seconds };
    };
    
    // Initial calculation
    setTimeLeft(calculateTimeLeft());
    
    // Update every second
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      
      if (newTimeLeft.minutes === 0 && newTimeLeft.seconds === 0) {
        clearInterval(timer);
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [deadline, onExpire, isExpiring]);
  
  const { minutes, seconds } = timeLeft;
  
  return (
    <div className={`p-2 mt-1 ${
      minutes < 2 
        ? "bg-red-400/10 border-red-400/20 text-red-300" 
        : minutes < 5 
          ? "bg-yellow-400/10 border-yellow-400/20 text-yellow-300" 
          : "bg-blue-400/10 border-blue-400/20 text-blue-300"
    } border rounded-md flex items-start space-x-2`}>
      <Clock className="h-4 w-4 shrink-0 mt-0.5" />
      <div className="text-xs">
        <p>Payment deadline: {deadline.toLocaleTimeString()}</p>
        <p className="font-medium mt-1">
          Time remaining: {minutes}:{seconds.toString().padStart(2, '0')}
        </p>
      </div>
    </div>
  );
};

  const [cryptoPrices, setCryptoPrices] = useState<Record<string, number>>({});
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Form states for posting an ad
  const [adType, setAdType] = useState("buy");
  const [adCrypto, setAdCrypto] = useState("BTC");
  const [adFiat, setAdFiat] = useState("USD");
  const [adPayment, setAdPayment] = useState("bank-transfer");
  const [adPriceType, setAdPriceType] = useState("fixed");
  const [adPrice, setAdPrice] = useState("");
  const [adAmount, setAdAmount] = useState("");
  const [adWindow, setAdWindow] = useState("15");
  const [adMinLimit, setAdMinLimit] = useState("");
  const [adMaxLimit, setAdMaxLimit] = useState("");
  const [adTerms, setAdTerms] = useState("");
  const [postingAd, setPostingAd] = useState(false);

  // Payment details for the ad
  const [paymentDetails, setPaymentDetails] = useState({
    // Bank transfer details
    bankName: "",
    accountNumber: "",
    accountHolderName: "",
    swiftCode: "",
    branchCode: "",

    // PayPal details
    paypalEmail: "",
    paypalName: "",

    // M-PESA details
    mobileNumber: "",
    mpesaName: "",

    // Mobile Money details
    mobileProvider: "",
    otherProvider: "",
    accountName: "",

    // Cash details
    meetingLocation: "",
    contactNumber: "",
    preferredTime: "",

    // Generic
    instructions: ""
  });

  // User Profile Customization
  const [sellerName, setSellerName] = useState("You");
  const [sellerAvatar, setSellerAvatar] = useState("https://api.dicebear.com/7.x/avataaars/svg?seed=You");
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [avatarOptions, setAvatarOptions] = useState([
    {
      id: "default",
      imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=You",
      name: "Default",
      bgColor: "#4F46E5",
    },
    {
      id: "pixel",
      imageUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=vertex",
      name: "Pixel Art",
      bgColor: "#10B981",
    },
    {
      id: "shapes",
      imageUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=trading",
      name: "Shapes",
      bgColor: "#F59E0B",
    },
    {
      id: "initials",
      imageUrl: "https://api.dicebear.com/7.x/initials/svg?seed=" + sellerName,
      name: "Initials",
      bgColor: "#EC4899",
    },
    {
      id: "abstract",
      imageUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=finance",
      name: "Abstract",
      bgColor: "#6366F1",
    },
    {
      id: "avataaars",
      imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=" + sellerName,
      name: "Avataaars",
      bgColor: "#8B5CF6",
    },
    {
      id: "micah",
      imageUrl: "https://api.dicebear.com/7.x/micah/svg?seed=" + sellerName,
      name: "Micah",
      bgColor: "#F97316",
    },
    {
      id: "thumbs",
      imageUrl: "https://api.dicebear.com/7.x/thumbs/svg?seed=" + sellerName,
      name: "Thumbs",
      bgColor: "#0EA5E9",
    },
    {
      id: "adventurer",
      imageUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=" + sellerName,
      name: "Adventurer",
      bgColor: "#14B8A6",
    },
    {
      id: "lorelei",
      imageUrl: "https://api.dicebear.com/7.x/lorelei/svg?seed=" + sellerName,
      name: "Lorelei",
      bgColor: "#EF4444",
    },
  ]);
  const [selectedAvatarId, setSelectedAvatarId] = useState("avataaars");

  const cryptos = ["BTC", "ETH", "USDT", "BNB", "DOGE", "XRP", "SOL"];
  const fiats = ["USD", "EUR", "GBP", "CAD", "AUD", "NGN", "KES", "ZAR", "GHS"];

  const paymentMethods = [
    { id: "all", name: "All Payment Methods" },
    { id: "bank-transfer", name: "Bank Transfer" },
    { id: "mpesa", name: "M-PESA" },
    { id: "paypal", name: "PayPal" },
    { id: "cash", name: "Cash in Person" },
    { id: "mobile-money", name: "Mobile Money" },
    { id: "credit-card", name: "Credit/Debit Card" },
  ];

  // Load offers, orders, and prices
  useEffect(() => {
    // Load all data on component mount
    const loadInitialData = async () => {
      setOffersLoading(true);
      try {
        await Promise.all([
          loadCurrentPrices(),
          loadOffers(),
          loadUserOrders()
        ]);
      } catch (error) {
        console.error("Error loading initial data:", error);
        toast.error("Failed to load marketplace data. Please try refreshing.");
      } finally {
        setOffersLoading(false);
      }
    };

    loadInitialData();

    // Set up interval to refresh prices every minute
    const priceInterval = setInterval(() => {
      loadCurrentPrices();
    }, 60000); // 1 minute

    // Set up interval to check for new orders every minute
    // Using a reference to track order count to avoid dependency on userOrders.length
    // which can cause excessive re-rendering and sounds
    const lastOrderCountRef = { current: userOrders.length };
    
    const orderInterval = setInterval(async () => {
      try {
        // Skip if there are ongoing loading operations
        if (ordersLoading) return;
        
        const currentOrderCount = lastOrderCountRef.current;
        const newOrders = await p2pService.getUserOrders();

        // Update reference with latest count
        lastOrderCountRef.current = newOrders.length;
        
        if (newOrders.length > currentOrderCount) {
          setUserOrders(newOrders);

          toast.success("New order received", {
            description: "You have a new P2P trading order"
          });
        }
      } catch (error) {
        console.error("Error checking for new orders:", error);
      }
    }, 120000); // Increased to 2 minutes to reduce frequency

    return () => {
      clearInterval(priceInterval);
      clearInterval(orderInterval);
    };
  }, []); // Removed userOrders.length dependency to prevent excessive refreshing

  // Filter offers when filters change
  useEffect(() => {
    filterOffers();
  }, [activeTab, selectedCrypto, selectedFiat, selectedPayment, searchQuery]);

  const loadCurrentPrices = async () => {
    try {
      const prices = await p2pService.getCurrentPrices();
      setCryptoPrices(prices);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching current prices:", error);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        loadOffers(),
        loadCurrentPrices()
      ]);
      toast.success("Data refreshed successfully");
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh data. Please try again.");
    } finally {
      setRefreshing(false);
    }
  };

  const loadOffers = async () => {
    setOffersLoading(true);
    try {
      const [buyData, sellData] = await Promise.all([
        p2pService.getBuyOffers(),
        p2pService.getSellOffers()
      ]);

      setBuyOffers(buyData);
      setSellOffers(sellData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching offers:", error);
      toast.error("Failed to load offers. Please try again.");
    } finally {
      setOffersLoading(false);
    }
  };

  const loadUserOrders = async () => {
    setOrdersLoading(true);
    try {
      // Fetch orders from p2p service
      const orders = await p2pService.getUserOrders();
      
      // If no orders found but should have some (notification triggered this), 
      // try a second time after a short delay
      if (orders.length === 0) {
        console.log("No orders found on first try, attempting second fetch after delay");
        
        // Short delay before second attempt
        await new Promise(resolve => setTimeout(resolve, 500));
        const secondTryOrders = await p2pService.getUserOrders();
        
        console.log(`Second fetch found ${secondTryOrders.length} orders`);
        setUserOrders(secondTryOrders);
      } else {
        console.log(`Found ${orders.length} orders for current user`);
        setUserOrders(orders);
      }
    } catch (error) {
      console.error("Error fetching user orders:", error);
      toast.error("Failed to load your orders. Please try again.");
    } finally {
      setOrdersLoading(false);
    }
  };

  const filterOffers = async () => {
    setOffersLoading(true);
    try {
      const filteredOffers = await p2pService.filterOffers(
        activeTab as 'buy' | 'sell',
        {
          crypto: selectedCrypto,
          fiat: selectedFiat,
          paymentMethod: selectedPayment,
          searchQuery: searchQuery
        }
      );

      if (activeTab === "buy") {
        setBuyOffers(filteredOffers);
      } else {
        setSellOffers(filteredOffers);
      }
    } catch (error) {
      console.error("Error filtering offers:", error);
    } finally {
      setOffersLoading(false);
    }
  };

  // Chat messages state for P2P orders
  const [chatMessages, setChatMessages] = useState<{[orderId: string]: {sender: string, text: string, timestamp: Date}[]}>({});
  const [chatMessage, setChatMessage] = useState("");
  const [selectedOrderForChat, setSelectedOrderForChat] = useState<string | null>(null);
  const [showChatDialog, setShowChatDialog] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [typingStatus, setTypingStatus] = useState<{[orderId: string]: boolean}>({});
  const [chatAutoRefresh, setChatAutoRefresh] = useState(true);

  // Edit Offer State
  const [editingOffer, setEditingOffer] = useState<P2POffer | null>(null);

  const handleOrderSubmit = async () => {
    if (!selectedOffer) return;

    const amount = parseFloat(buyAmount);
    if (isNaN(amount)) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (amount < selectedOffer.limits.min || amount > selectedOffer.limits.max) {
      toast.error(`Amount must be between ${selectedOffer.limits.min} and ${selectedOffer.limits.max} ${selectedOffer.fiatCurrency}`);
      return;
    }

    // Calculate crypto amount before placing order to validate
    const cryptoAmount = amount / selectedOffer.price;
    if (cryptoAmount > selectedOffer.availableAmount) {
      toast.error(`Not enough crypto available. Maximum: ${selectedOffer.availableAmount.toFixed(6)} ${selectedOffer.crypto}`);
      return;
    }

    // Add a slight buffer to account for rounding differences (0.1% less than max)
    const safeCryptoAmount = cryptoAmount * 0.999;
    if (safeCryptoAmount > selectedOffer.availableAmount) {
      setBuyAmount((selectedOffer.availableAmount * selectedOffer.price * 0.999).toFixed(2));
      setBuyTotal(selectedOffer.availableAmount * 0.999);
      toast.warning(`Amount adjusted to match available crypto: ${selectedOffer.availableAmount.toFixed(6)} ${selectedOffer.crypto}`);
    }

    setProcessingOrder(true);

    try {
      console.log("Placing order for offer ID:", selectedOffer.id, "User ID:", selectedOffer.userId);
      
      // Important logging for debugging notification issues
      console.log("Current user ID:", auth.currentUser?.uid);
      console.log("Offer owner ID:", selectedOffer.userId);
      console.log("Is same user?", selectedOffer.userId === auth.currentUser?.uid);
      
      const order = await p2pService.placeOrder(
        selectedOffer.id,
        amount,
        activeTab as 'buy' | 'sell'
      );

      // Play notification sound to indicate order was placed
      const audio = new Audio('/sounds/payment_success.mp3');
      audio.volume = 0.5;
      await audio.play().catch(e => console.error("Error playing sound:", e));

      toast.success("Order placed successfully", {
        description: `Your order to ${activeTab} ${(amount / selectedOffer.price).toFixed(8)} ${selectedOffer.crypto} has been placed.`
      });

      // Ensure notification is sent to offer owner
      if (selectedOffer.userId && selectedOffer.userId !== auth.currentUser?.uid) {
        try {
          console.log("Sending direct notification to user:", selectedOffer.userId);
          
          // Create notification with explicit parameters
          const notificationCreated = await p2pService.createOfferNotification(
            selectedOffer.userId,
            selectedOffer.id,
            order?.id || `order-${Date.now()}`,
            activeTab as 'buy' | 'sell',
            amount,
            selectedOffer.crypto,
            selectedOffer.fiatCurrency
          );
          
          console.log("Notification created successfully:", notificationCreated);
          
          // Force a sound alert to indicate notification was sent
          const notifyAudio = new Audio('/sounds/alert.mp3');
          notifyAudio.volume = 0.3;
          await notifyAudio.play().catch(e => console.error("Error playing notification sound:", e));
        } catch (notifyError) {
          console.error("Error sending notification:", notifyError);
        }
      } else {
        console.log("Not sending notification - same user or missing user ID");
      }

      // Reload orders and offers
      await loadOffers();
      await loadUserOrders();

      // Open chat automatically for new order
      setTimeout(() => {
        if (order) {
          openChat(order.id);
        } else {
          // Find the most recent order by checking creation date
          const sortedOrders = [...userOrders].sort((a, b) => 
            b.createdAt.getTime() - a.createdAt.getTime()
          );
          
          if (sortedOrders.length > 0) {
            openChat(sortedOrders[0].id);
          }
        }
      }, 1000);

      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error(error instanceof Error ? error.message : "Failed to place order. Please try again.");
    } finally {
      setProcessingOrder(false);
    }
  };

  const openChat = async (orderId: string) => {
    setSelectedOrderForChat(orderId);
    setLoadingMessages(true);

    try {
      // Try to fetch existing messages from Firebase
      const messages = await p2pService.getChatMessages(orderId);
      
      // If messages exist in Firebase, use them
      if (messages && messages.length > 0) {
        setChatMessages({
          ...chatMessages,
          [orderId]: messages
        });
      } else {
        // Initialize chat if no messages exist
        const order = userOrders.find(o => o.id === orderId);

        // Create initial messages including payment instructions
        const initialMessages = [
          {
            sender: 'System',
            text: 'Chat started. Please be respectful and keep all transaction details within the platform.',
            timestamp: new Date()
          }
        ];

        // Add payment instructions if it's a buy order
        if (order && order.type === 'buy') {
          initialMessages.push({
            sender: order.seller,
            text: `Please send ${order.amount.toLocaleString()} ${order.fiatCurrency} using the payment method shown in the details panel. After payment, click the "I've Paid" button.`,
            timestamp: new Date(Date.now() + 1000)
          });

          // Add a second message about payment details
          if (order.paymentDetails && Object.keys(order.paymentDetails).some(key => order.paymentDetails?.[key])) {
            initialMessages.push({
              sender: order.seller,
              text: `I've provided my payment details in the panel on the right. Please use them exactly as shown.`,
              timestamp: new Date(Date.now() + 2000)
            });
          } else {
            initialMessages.push({
              sender: order.seller,
              text: `I'll share my payment details shortly.`,
              timestamp: new Date(Date.now() + 2000)
            });
          }
        }

        // Add release funds instruction if it's a sell order
        if (order && order.type === 'sell') {
          initialMessages.push({
            sender: 'System',
            text: `Wait for buyer to confirm payment. Once confirmed, verify the payment in your account and release the funds.`,
            timestamp: new Date(Date.now() + 1000)
          });
        }

        // Add different instructions based on order status
        if (order && order.status === 'awaiting_release') {
          initialMessages.push({
            sender: 'System',
            text: order.type === 'buy' 
              ? `Your payment has been marked as completed. Waiting for the seller to verify and release the funds.` 
              : `The buyer has marked the payment as completed. Please verify the payment and release the funds if confirmed.`,
            timestamp: new Date(Date.now() + 3000)
          });
        } else if (order && order.status === 'completed') {
          initialMessages.push({
            sender: 'System',
            text: `This transaction has been completed successfully.`,
            timestamp: new Date(Date.now() + 3000)
          });
        } else if (order && order.status === 'cancelled') {
          initialMessages.push({
            sender: 'System',
            text: `This transaction has been cancelled.`,
            timestamp: new Date(Date.now() + 3000)
          });
        }

        setChatMessages({
          ...chatMessages,
          [orderId]: initialMessages
        });

        // Save these initial messages to Firebase
        for (const message of initialMessages) {
          await p2pService.addChatMessage(
            orderId, 
            message.sender, 
            message.text, 
            message.timestamp
          );
        }
      }
      
      // Set up periodic refresh for chat messages
      if (chatAutoRefresh) {
        const chatRefreshInterval = setInterval(async () => {
          if (showChatDialog && selectedOrderForChat === orderId) {
            const refreshedMessages = await p2pService.getChatMessages(orderId);
            if (refreshedMessages && refreshedMessages.length > 0) {
              // Check if we have new messages
              const currentMessages = chatMessages[orderId] || [];
              if (refreshedMessages.length > currentMessages.length) {
                // Play notification sound for new message
                const audio = new Audio('/sounds/alert.mp3');
                audio.play().catch(e => console.error("Error playing sound:", e));
                
                setChatMessages({
                  ...chatMessages,
                  [orderId]: refreshedMessages
                });
              }
            }
          }
        }, 5000); // Refresh every 5 seconds
        
        // Clean up interval when chat dialog closes
        return () => clearInterval(chatRefreshInterval);
      }
    } catch (error) {
      console.error("Error loading chat messages:", error);
      toast.error("Failed to load chat messages");
    } finally {
      setLoadingMessages(false);
      setShowChatDialog(true);
    }
  };

  const sendChatMessage = async () => {
    if (!chatMessage.trim() || !selectedOrderForChat) return;
    
    setSendingMessage(true);
    try {
      const messageTime = new Date();
      
      // Indicate typing status
      setTypingStatus(prev => ({
        ...prev,
        [selectedOrderForChat]: true
      }));
      
      // Save message to Firebase
      const success = await p2pService.addChatMessage(
        selectedOrderForChat,
        'You',
        chatMessage,
        messageTime
      );
      
      if (success) {
        // Update local state immediately
        const newMessages = {
          ...chatMessages,
          [selectedOrderForChat]: [
            ...(chatMessages[selectedOrderForChat] || []),
            {
              sender: 'You',
              text: chatMessage,
              timestamp: messageTime
            }
          ]
        };
        
        setChatMessages(newMessages);
        setChatMessage('');
        
        // Play sent message sound
        const audio = new Audio('/sounds/transfer.mp3');
        audio.volume = 0.2;
        audio.play().catch(e => console.error("Error playing sound:", e));
        
        // In a real app, we'd use a websocket or real-time DB
        // For demo, simulate a response after 2 seconds
        setTimeout(async () => {
          // Find the counterparty based on order details
          const order = userOrders.find(o => o.id === selectedOrderForChat);
          const counterparty = order?.seller === 'You' 
            ? order?.buyer || 'Counterparty' 
            : order?.seller || 'Counterparty';
          
          // Generate appropriate responses based on message content
          let responseMessage = 'I\'ve received your message. Let me check and get back to you shortly.';
          
          // More contextual responses based on message content
          const lowerCaseMessage = chatMessage.toLowerCase();
          if (lowerCaseMessage.includes('payment') || lowerCaseMessage.includes('paid') || lowerCaseMessage.includes('sent')) {
            responseMessage = 'Thanks for confirming your payment. Please remember to click the "I\'ve Paid" button so I can verify the transaction.';
          } else if (lowerCaseMessage.includes('hello') || lowerCaseMessage.includes('hi') || lowerCaseMessage.includes('hey')) {
            responseMessage = 'Hello! I\'m here to help with this transaction. Let me know if you have any questions.';
          } else if (lowerCaseMessage.includes('help') || lowerCaseMessage.includes('how')) {
            responseMessage = 'For this transaction, please follow the payment instructions in the panel on the right. If you have any issues, let me know.';
          } else if (lowerCaseMessage.includes('thank') || lowerCaseMessage.includes('thanks')) {
            responseMessage = 'You\'re welcome! Happy to help with this transaction.';
          }
          
          const responseTime = new Date();
          
          // Save response to Firebase
          await p2pService.addChatMessage(
            selectedOrderForChat as string,
            counterparty,
            responseMessage,
            responseTime
          );
          
          // Sound notification removed
          
          // Update local state with the response
          setChatMessages(prevMessages => ({
            ...prevMessages,
            [selectedOrderForChat as string]: [
              ...(prevMessages[selectedOrderForChat as string] || []),
              {
                sender: counterparty,
                text: responseMessage,
                timestamp: responseTime
              }
            ]
          }));
          
          // Clear typing status
          setTypingStatus(prev => ({
            ...prev,
            [selectedOrderForChat as string]: false
          }));
        }, 2000);
      } else {
        toast.error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  const handlePostAd = async () => {
    // Validate inputs
    if (!adPrice || !adAmount || !adMinLimit || !adMaxLimit) {
      toast.error("Please fill in all required fields");
      return;
    }

    const price = parseFloat(adPrice);
    const amount = parseFloat(adAmount);
    const minLimit = parseFloat(adMinLimit);
    const maxLimit = parseFloat(adMaxLimit);

    if (isNaN(price) || isNaN(amount) || isNaN(minLimit) || isNaN(maxLimit)) {
      toast.error("Please enter valid numbers");
      return;
    }

    if (minLimit > maxLimit) {
      toast.error("Minimum limit cannot be greater than maximum limit");
      return;
    }

    // Validate payment details based on selected payment method
    if (adType === "sell") {
      if (adPayment === "bank-transfer" && (!paymentDetails.bankName || !paymentDetails.accountNumber || !paymentDetails.accountHolderName)) {
        toast.error("Please complete bank account details");
        return;
      } else if (adPayment === "paypal" && !paymentDetails.paypalEmail) {
        toast.error("Please enter PayPal email");
        return;
      } else if ((adPayment === "mpesa" || adPayment === "mobile-money") && !paymentDetails.mobileNumber) {
        toast.error("Please enter mobile number");
        return;
      }
    }

    setPostingAd(true);

    try {
      // Convert payment method ID to name
      const paymentMethodName = paymentMethods.find(m => m.id === adPayment)?.name || adPayment;

      // Prepare payment details based on payment method
      let adPaymentDetails = {};
      if (adType === "sell") {
        switch (adPayment) {
          case "bank-transfer":
            adPaymentDetails = {
              bankName: paymentDetails.bankName,
              accountNumber: paymentDetails.accountNumber,
              accountHolderName: paymentDetails.accountHolderName,
              swiftCode: paymentDetails.swiftCode,
              branchCode: paymentDetails.branchCode,
              instructions: paymentDetails.instructions
            };
            break;
          case "paypal":
            adPaymentDetails = {
              paypalEmail: paymentDetails.paypalEmail,
              paypalName: paymentDetails.paypalName,
              instructions: paymentDetails.instructions
            };
            break;
          case "mpesa":
            adPaymentDetails = {
              mobileNumber: paymentDetails.mobileNumber,
              mpesaName: paymentDetails.mpesaName || sellerName,
              instructions: paymentDetails.instructions
            };
            break;
          case "mobile-money":
            adPaymentDetails = {
              mobileNumber: paymentDetails.mobileNumber,
              mobileProvider: paymentDetails.mobileProvider,
              otherProvider: paymentDetails.otherProvider,
              accountName: paymentDetails.accountName || sellerName,
              instructions: paymentDetails.instructions
            };
            break;
          case "cash":
            adPaymentDetails = {
              meetingLocation: paymentDetails.meetingLocation,
              contactNumber: paymentDetails.contactNumber,
              preferredTime: paymentDetails.preferredTime,
              instructions: paymentDetails.instructions
            };
            break;
          default:
            adPaymentDetails = {
              instructions: paymentDetails.instructions
            };
        }
      } else {
        // For buy ads, still include instructions
        adPaymentDetails = {
          instructions: paymentDetails.instructions
        };
      }

      // Log payment details before creating offer
      console.log("Payment details being submitted:", adPaymentDetails);

      const newOffer: Omit<P2POffer, 'id' | 'createdAt'> = {
        user: {
          name: sellerName || "Anonymous",
          avatar: sellerAvatar,
          rating: 5.0,
          completedTrades: Math.floor(Math.random() * 50) + 10,
          orderCount: Math.floor(Math.random() * 100) + 50,
          completionRate: (99 + Math.random()),
          responseTime: Math.floor(Math.random() * 10) + 5
        },
        crypto: adCrypto,
        price: price,
        fiatCurrency: adFiat,
        paymentMethods: [paymentMethodName],
        limits: {
          min: minLimit,
          max: maxLimit
        },
        availableAmount: amount,
        terms: adTerms || "Standard terms apply.",
        paymentDetails: adPaymentDetails, // Add payment details to the offer
        type: adType as 'buy' | 'sell' // Explicitly set the type
      };

      await p2pService.createP2POffer(newOffer);

      toast.success("Advertisement posted successfully");

      // Reset form
      setAdPrice("");
      setAdAmount("");
      setAdMinLimit("");
      setAdMaxLimit("");
      setAdTerms("");
      setPaymentDetails({
        bankName: "",
        accountNumber: "",
        accountHolderName: "",
        swiftCode: "",
        branchCode: "",
        paypalEmail: "",
        paypalName: "",
        mobileNumber: "",
        mpesaName: "",
        mobileProvider: "",
        otherProvider: "",
        accountName: "",
        meetingLocation: "",
        contactNumber: "",
        preferredTime: "",
        instructions: ""
      });

      // Reload offers - important to get the latest data
      await loadOffers();

      // Filter offers based on current filters to ensure the new ad shows up
      await filterOffers();

      // Switch to appropriate tab
      setActiveTab(adType);
    } catch (error) {
      console.error("Error posting ad:", error);
      toast.error(error instanceof Error ? error.message : "Failed to post advertisement. Please try again.");
    } finally {
      setPostingAd(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      await p2pService.cancelOrder(orderId);
      toast.success("Order cancelled successfully");
      loadUserOrders();
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error("Failed to cancel order. Please try again.");
    }
  };

  const calculateTotal = (amount: string, price: number) => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return 0;
    return numAmount / price;
  };

  // Render payment details fields based on selected payment method
  const renderPaymentDetailsFields = () => {
    switch (adPayment) {
      case "bank-transfer":
        return (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-white text-sm">Bank Name</Label>
              <Input 
                placeholder="Enter bank name" 
                className="bg-background/40 border-white/10 text-white placeholder:text-white/50 h-9"
                value={paymentDetails.bankName}
                onChange={(e) => setPaymentDetails({...paymentDetails, bankName: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-white text-sm">Account Number</Label>
              <Input 
                placeholder="Enter account number" 
                className="bg-background/40 border-white/10 text-white placeholder:text-white/50 h-9"
                value={paymentDetails.accountNumber}
                onChange={(e) => setPaymentDetails({...paymentDetails, accountNumber: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-white text-sm">Account Holder Name</Label>
              <Input 
                placeholder="Enter account holder name" 
                className="bg-background/40 border-white/10 text-white placeholder:text-white/50 h-9"
                value={paymentDetails.accountHolderName}
                onChange={(e) => setPaymentDetails({...paymentDetails, accountHolderName: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-white text-sm">SWIFT/BIC Code (Optional)</Label>
              <Input 
                placeholder="Enter SWIFT/BIC code" 
                className="bg-background/40 border-white/10 text-white placeholder:text-white/50 h-9"
                value={paymentDetails.swiftCode}
                onChange={(e) => setPaymentDetails({...paymentDetails, swiftCode: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-white text-sm">Branch Code (Optional)</Label>
              <Input 
                placeholder="Enter branch code" 
                className="bg-background/40 border-white/10 text-white placeholder:text-white/50 h-9"
                value={paymentDetails.branchCode}
                onChange={(e) => setPaymentDetails({...paymentDetails, branchCode: e.target.value})}
              />
            </div>
          </div>
        );
      case "paypal":
        return (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-white text-sm">PayPal Email</Label>
              <Input 
                placeholder="Enter PayPal email" 
                className="bg-background/40 border-white/10 text-white placeholder:text-white/50 h-9"
                value={paymentDetails.paypalEmail}
                onChange={(e) => setPaymentDetails({...paymentDetails, paypalEmail: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-white text-sm">Full Name (Optional)</Label>
              <Input 
                placeholder="Enter your full name" 
                className="bg-background/40 border-white/10 text-white placeholder:text-white/50 h-9"
                value={paymentDetails.paypalName}
                onChange={(e) => setPaymentDetails({...paymentDetails, paypalName: e.target.value})}
              />
            </div>
          </div>
        );
      case "mpesa":
        return (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-white text-sm">M-PESA Number</Label>
              <Input 
                placeholder="Enter M-PESA number (e.g. +254712345678)" 
                className="bg-background/40 border-white/10 text-white placeholder:text-white/50 h-9"
                value={paymentDetails.mobileNumber}
                onChange={(e) => setPaymentDetails({...paymentDetails, mobileNumber: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-white text-sm">Account Name</Label>
              <Input 
                placeholder="Enter account name" 
                className="bg-background/40 border-white/10 text-white placeholder:text-white/50 h-9"
                value={paymentDetails.mpesaName}
                onChange={(e) => setPaymentDetails({...paymentDetails, mpesaName: e.target.value})}
              />
            </div>
          </div>
        );
      case "mobile-money":
        return (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-white text-sm">Mobile Number</Label>
              <Input 
                placeholder="Enter mobile number (e.g. +254712345678)" 
                className="bg-background/40 border-white/10 text-white placeholder:text-white/50 h-9"
                value={paymentDetails.mobileNumber}
                onChange={(e) => setPaymentDetails({...paymentDetails, mobileNumber: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-white text-sm">Provider</Label>
              <Select 
                value={paymentDetails.mobileProvider || "other"}
                onValueChange={(value) => setPaymentDetails({...paymentDetails, mobileProvider: value})}
              >
                <SelectTrigger className="bg-background/40 border-white/10 text-white">
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mtn">MTN Mobile Money</SelectItem>
                  <SelectItem value="airtel">Airtel Money</SelectItem>
                  <SelectItem value="orange">Orange Money</SelectItem>
                  <SelectItem value="vodafone">Vodafone Cash</SelectItem>
                  <SelectItem value="tigo">Tigo Cash</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {paymentDetails.mobileProvider === "other" && (
              <div className="space-y-1">
                <Label className="text-white text-sm">Provider Name</Label>
                <Input 
                  placeholder="Enter provider name" 
                  className="bg-background/40 border-white/10 text-white placeholder:text-white/50 h-9"
                  value={paymentDetails.otherProvider}
                  onChange={(e) => setPaymentDetails({...paymentDetails, otherProvider: e.target.value})}
                />
              </div>
            )}
            <div className="space-y-1">
              <Label className="text-white text-sm">Account Name</Label>
              <Input 
                placeholder="Enter account name" 
                className="bg-background/40 border-white/10 text-white placeholder:text-white/50 h-9"
                value={paymentDetails.accountName}
                onChange={(e) => setPaymentDetails({...paymentDetails, accountName: e.target.value})}
              />
            </div>
          </div>
        );
      case "cash":
        return (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-white text-sm">Meeting Location</Label>
              <Input 
                placeholder="Enter meeting location" 
                className="bg-background/40 border-white/10 text-white placeholder:text-white/50 h-9"
                value={paymentDetails.meetingLocation}
                onChange={(e) => setPaymentDetails({...paymentDetails, meetingLocation: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-white text-sm">Contact Number</Label>
              <Input 
                placeholder="Enter contact number" 
                className="bg-background/40 border-white/10 text-white placeholder:text-white/50 h-9"
                value={paymentDetails.contactNumber}
                onChange={(e) => setPaymentDetails({...paymentDetails, contactNumber: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-white text-sm">Preferred Time</Label>
              <Input 
                placeholder="Enter preferred meeting time" 
                className="bg-background/40 border-white/10 text-white placeholder:text-white/50 h-9"
                value={paymentDetails.preferredTime}
                onChange={(e) => setPaymentDetails({...paymentDetails, preferredTime: e.target.value})}
              />
            </div>
          </div>
        );
      case "credit-card":
        return (
          <div className="p-3 rounded-md bg-yellow-400/10 border border-yellow-400/20 flex items-start space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
            <div className="text-sm text-white/80">
              <p className="font-medium mb-1">Important Notice</p>
              <p>For security reasons, credit card information should be exchanged directly during the trade process through secure methods. No credit card details should be stored on this platform.</p>
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-white text-sm">Payment Instructions</Label>
              <Input 
                placeholder="Enter payment instructions" 
                className="bg-background/40 border-white/10 text-white placeholder:text-white/50 h-9"
                value={paymentDetails.instructions}
                onChange={(e) => setPaymentDetails({...paymentDetails, instructions: e.target.value})}
              />
            </div>
          </div>
        );
    }
  };

  const filteredOffers = activeTab === "buy" ? buyOffers : sellOffers;

  // Edit offer handler
  const handleEditOffer = async () => {
    if (!editingOffer) return;

    // Validate inputs
    if (!adPrice || !adAmount || !adMinLimit || !adMaxLimit) {
      toast.error("Please fill in all required fields");
      return;
    }

    const price = parseFloat(adPrice);
    const amount = parseFloat(adAmount);
    const minLimit = parseFloat(adMinLimit);
    const maxLimit = parseFloat(adMaxLimit);

    if (isNaN(price) || isNaN(amount) || isNaN(minLimit) || isNaN(maxLimit)) {
      toast.error("Please enter valid numbers");
      return;
    }

    if (minLimit > maxLimit) {
      toast.error("Minimum limit cannot be greater than maximum limit");
      return;
    }

    // Validate payment details if it's a sell offer
    if (editingOffer.type === "sell") {
      if (adPayment === "bank-transfer" && (!paymentDetails.bankName || !paymentDetails.accountNumber || !paymentDetails.accountHolderName)) {
        toast.error("Please complete bank account details");
        return;
      } else if (adPayment === "paypal" && !paymentDetails.paypalEmail) {
        toast.error("Please enter PayPal email");
        return;
      } else if ((adPayment === "mpesa" || adPayment === "mobile-money") && !paymentDetails.mobileNumber) {
        toast.error("Please enter mobile number");
        return;
      }
    }

    try {
      // Convert payment method ID to name
      const paymentMethodName = paymentMethods.find(m => m.id === adPayment)?.name || adPayment;

      // Prepare payment details based on payment method
      let adPaymentDetails = {};
      if (editingOffer.type === "sell") {
        switch (adPayment) {
          case "bank-transfer":
            adPaymentDetails = {
              bankName: paymentDetails.bankName,
              accountNumber: paymentDetails.accountNumber,
              accountHolderName: paymentDetails.accountHolderName,
              swiftCode: paymentDetails.swiftCode
            };
            break;
          case "paypal":
            adPaymentDetails = {
              paypalEmail: paymentDetails.paypalEmail
            };
            break;
          case "mpesa":
          case "mobile-money":
            adPaymentDetails = {
              mobileNumber: paymentDetails.mobileNumber
            };
            break;
        }
      }

      const updatedOffer: P2POffer = {
        ...editingOffer,
        user: {
          name: sellerName,
          avatar: sellerAvatar,
          rating: 5.0,
          completedTrades: 10
        },
        crypto: adCrypto,
        price: price,
        fiatCurrency: adFiat,
        paymentMethods: [paymentMethodName],
        limits: {
          min: minLimit,
          max: maxLimit
        },
        availableAmount: amount,
        terms: adTerms || "Standard terms apply.",
        paymentDetails: adPaymentDetails // Add payment details to the offer
      };

      await p2pService.updateP2POffer(updatedOffer.id, updatedOffer);

      toast.success("Advertisement updated successfully");

      // Reload offers
      await loadOffers();
      await filterOffers();

      setShowEditDialog(false);
      setEditingOffer(null);
    } catch (error) {
      console.error("Error updating ad:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update advertisement. Please try again.");
    }
  };
  
  // Delete (deactivate) offer handler
  const handleDeleteOffer = async (offerId: string) => {
    try {
      const confirmed = window.confirm("Are you sure you want to deactivate this offer? Users will no longer be able to place orders against it.");
      
      if (!confirmed) return;
      
      await p2pService.deleteP2POffer(offerId);
      
      toast.success("Offer successfully deactivated");
      
      // Reload offers
      await loadOffers();
      await filterOffers();
    } catch (error) {
      console.error("Error deleting offer:", error);
      toast.error(error instanceof Error ? error.message : "Failed to deactivate offer. Please try again.");
    }
  };
  
  // Report offer handler
  const handleReportOffer = (offer: P2POffer) => {
    const reason = window.prompt("Please provide a reason for reporting this offer:");
    
    if (!reason) return;
    
    // In a real implementation, this would send the report to your backend
    toast.success("Report submitted successfully", {
      description: "Our team will review this offer and take appropriate action if needed."
    });
  };

  // Function to open the edit dialog and pre-populate the form
  const openEditDialog = (offer: P2POffer) => {
    setEditingOffer(offer);
    setAdCrypto(offer.crypto);
    setAdFiat(offer.fiatCurrency);
    setAdPayment(offer.paymentMethods[0]); // Assuming single payment method for simplicity
    setAdPrice(offer.price.toString());
    setAdAmount(offer.availableAmount.toString());
    setAdMinLimit(offer.limits.min.toString());
    setAdMaxLimit(offer.limits.max.toString());
    setAdTerms(offer.terms || "");
    setSellerName(offer.user.name);
    setSellerAvatar(offer.user.avatar);

    // Set payment details if available
    if (offer.paymentDetails) {
      const details = offer.paymentDetails as any;
      setPaymentDetails({
        bankName: details.bankName || "",
        accountNumber: details.accountNumber || "",
        accountHolderName: details.accountHolderName || "",
        swiftCode: details.swiftCode || "",
        paypalEmail: details.paypalEmail || "",
        mobileNumber: details.mobileNumber || ""
      });
    }

    setShowEditDialog(true);
  };

  // State for edit dialog visibility
  const [showEditDialog, setShowEditDialog] = useState(false);

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">P2P Trading</h1>
            <p className="text-sm text-white/70 mt-1">Buy and sell crypto directly with other users</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1" 
              onClick={refreshData}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            
            {/* Notification indicator */}
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative"
                  onClick={async () => {
                    // Pre-fetch notifications when clicking the button
                    try {
                      await p2pService.getUserNotifications();
                    } catch (error) {
                      console.error("Error pre-fetching notifications:", error);
                    }
                  }}
                >
                  <MessageCircle className="h-5 w-5 text-white/70" />
                  <span className="sr-only">Check notifications</span>
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold flex items-center justify-center animate-pulse">!</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-background/95 backdrop-blur-xl border-white/10 text-white">
                <DialogHeader>
                  <DialogTitle>Notifications</DialogTitle>
                  <DialogDescription className="text-white/70">
                    Your P2P trade notifications and alerts
                  </DialogDescription>
                </DialogHeader>
                <NotificationsList />
              </DialogContent>
            </Dialog>
            
            {isDemoMode && <div className="text-sm text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-md">Demo Mode</div>}
          </div>
        </div>

        {/* Current Prices */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {Object.entries(cryptoPrices).map(([crypto, price]) => (
            <Card key={crypto} className="bg-background/40 backdrop-blur-lg border-white/10 shadow-none">
              <CardContent className="p-3 flex justify-between items-center">
                <div className="font-medium text-white">{crypto}</div>
                <div className="text-sm text-white/90">${price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 8})}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
          <CardHeader>
            <div className="flex justify-between">
              <div>
                <CardTitle>P2P Market</CardTitle>
                <CardDescription className="text-white/70">
                  Trade cryptocurrencies directly with other users using your preferred payment methods
                </CardDescription>
              </div>
              <div className="text-xs text-white/50 text-right">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="buy" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="bg-background/40 backdrop-blur-lg border-white/10 text-white mb-6">
                <TabsTrigger value="buy" className="text-white data-[state=active]:bg-accent">
                  Buy Crypto
                </TabsTrigger>
                <TabsTrigger value="sell" className="text-white data-[state=active]:bg-accent">
                  Sell Crypto
                </TabsTrigger>
                <TabsTrigger value="orders" className="text-white data-[state=active]:bg-accent">
                  My Orders
                </TabsTrigger>
                <TabsTrigger value="post" className="text-white data-[state=active]:bg-accent">
                  Post Ad
                </TabsTrigger>
              </TabsList>

              <TabsContent value="buy" className="mt-0">
                <div className="flex flex-col space-y-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
                        <SelectTrigger className="bg-background/40 border-white/10">
                          <SelectValue placeholder="Select Crypto" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Cryptocurrencies</SelectItem>
                          {cryptos.map(crypto => (
                            <SelectItem key={crypto} value={crypto}>{crypto}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={selectedFiat} onValueChange={setSelectedFiat}>
                        <SelectTrigger className="bg-background/40 border-white/10">
                          <SelectValue placeholder="Select Fiat" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Fiat Currencies</SelectItem>
                          {fiats.map(fiat => (
                            <SelectItem key={fiat} value={fiat}>{fiat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={selectedPayment} onValueChange={setSelectedPayment}>
                        <SelectTrigger className="bg-background/40 border-white/10">
                          <SelectValue placeholder="Payment Method" />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentMethods.map(method => (
                            <SelectItem key={method.id} value={method.id}>{method.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="relative w-full md:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search merchants..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-background/40 border-white/10"
                      />
                    </div>
                  </div>

                  <div className="bg-background/20 backdrop-blur-lg border border-white/10 rounded-md overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-background/40">
                          <TableHead className="text-white">Advertiser</TableHead>
                          <TableHead className="text-white">Price</TableHead>
                          <TableHead className="text-white">Limits</TableHead>
                          <TableHead className="text-white">Payment</TableHead>
                          <TableHead className="text-white">Available</TableHead>
                          <TableHead className="text-white"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {offersLoading ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-white/60">
                              <div className="flex justify-center items-center">
                                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                Loading offers...
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : filteredOffers.length > 0 ? (
                          filteredOffers.map((offer) => (
                            <TableRow key={offer.id} className="hover:bg-background/40">
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={offer.user.avatar} />
                                    <AvatarFallback>{offer.user.name.slice(0, 2)}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="flex items-center gap-1">
                                      {offer.user.name}
                                      <Badge variant="outline" className="ml-1 text-xs py-0 px-1 bg-green-900/20 text-green-400 border-green-800">
                                        {offer.user.rating}
                                        <Star className="h-3 w-3 ml-0.5 fill-current" />
                                      </Badge>
                                    </div>
                                    <div className="text-xs text-white/60">
                                      {offer.user.orderCount || Math.floor(Math.random() * 1000) + 100} orders
                                    </div>
                                    <div className="text-xs text-white/60">
                                      {offer.user.completionRate?.toFixed(2) || (99 + Math.random()).toFixed(2)}% completion
                                    </div>
                                    {offer.user.responseTime && (
                                      <div className="text-xs text-white/60">
                                        {offer.user.responseTime} min response
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">
                                {offer.price.toLocaleString()} {offer.fiatCurrency}
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  {offer.limits.min.toLocaleString()} - {offer.limits.max.toLocaleString()} {offer.fiatCurrency}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {offer.paymentMethods.map((method, index) => (
                                    <Badge key={index} variant="outline" className="bg-background/40 border-white/10 text-white">
                                      {method}
                                    </Badge>
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">
                                  {offer.availableAmount.toFixed(6)} {offer.crypto}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button 
                                    variant="default" 
                                    className="bg-[#F2FF44] text-black hover:bg-[#E2EF34]"
                                    onClick={() => {
                                      setSelectedOffer(offer);
                                      setBuyAmount("");
                                      setBuyTotal(0);
                                      setIsDialogOpen(true);
                                    }}
                                  >
                                    {activeTab === "buy" ? "Buy" : "Sell"}
                                  </Button>

                                  {auth.currentUser && offer.userId === auth.currentUser?.uid ? (
                                    <>
                                      <Button 
                                        variant="outline" 
                                        onClick={() => openEditDialog(offer)}
                                      >
                                        Edit
                                      </Button>
                                      <Button 
                                        variant="outline" 
                                        className="text-red-400 border-red-400/20 hover:bg-red-400/10"
                                        onClick={() => handleDeleteOffer(offer.id)}
                                      >
                                        Deactivate
                                      </Button>
                                    </>
                                  ) : (
                                    <Button 
                                      variant="ghost" 
                                      className="text-orange-400 hover:bg-orange-400/10 hover:text-orange-300"
                                      onClick={() => handleReportOffer(offer)}
                                    >
                                      Report
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-white/60">
                              No offers found matching your criteria
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="sell" className="mt-0">
                <div className="flex flex-col space-y-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
                        <SelectTrigger className="bg-background/40 border-white/10">
                          <SelectValue placeholder="Select Crypto" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Cryptocurrencies</SelectItem>
                          {cryptos.map(crypto => (
                            <SelectItem key={crypto} value={crypto}>{crypto}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={selectedFiat} onValueChange={setSelectedFiat}>
                        <SelectTrigger className="bg-background/40 border-white/10">
                          <SelectValue placeholder="Select Fiat" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Fiat Currencies</SelectItem>
                          {fiats.map(fiat => (
                            <SelectItem key={fiat} value={fiat}>{fiat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={selectedPayment} onValueChange={setSelectedPayment}>
                        <SelectTrigger className="bg-background/40 border-white/10">
                          <SelectValue placeholder="Payment Method" />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentMethods.map(method => (
                            <SelectItem key={method.id} value={method.id}>{method.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="relative w-full md:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search merchants..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-background/40 border-white/10"
                      />
                    </div>
                  </div>

                  <div className="bg-background/20 backdrop-blur-lg border border-white/10 rounded-md overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-background/40">
                          <TableHead className="text-white">Advertiser</TableHead>
                          <TableHead className="text-white">Price</TableHead>
                          <TableHead className="text-white">Limits</TableHead>
                          <TableHead className="text-white">Payment</TableHead>
                          <TableHead className="text-white">Available</TableHead>
                          <TableHead className="text-white"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {offersLoading ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-white/60">
                              <div className="flex justify-center items-center">
                                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                Loading offers...
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : filteredOffers.length > 0 ? (
                          filteredOffers.map((offer) => (
                            <TableRow key={offer.id} className="hover:bg-background/40">
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={offer.user.avatar} />
                                    <AvatarFallback>{offer.user.name.slice(0, 2)}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="flex items-center gap-1">
                                      {offer.user.name}
                                      <Badge variant="outline" className="ml-1 text-xs py-0 px-1 bg-green-900/20 text-green-400 border-green-800">
                                        {offer.user.rating}
                                        <Star className="h-3 w-3 ml-0.5 fill-current" />
                                      </Badge>
                                    </div>
                                    <div className="text-xs text-white/60">
                                      {offer.user.orderCount || Math.floor(Math.random() * 1000) + 100} orders
                                    </div>
                                    <div className="text-xs text-white/60">
                                      {offer.user.completionRate?.toFixed(2) || (99 + Math.random()).toFixed(2)}% completion
                                    </div>
                                    {offer.user.responseTime && (
                                      <div className="text-xs text-white/60">
                                        {offer.user.responseTime} min response
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">
                                {offer.price.toLocaleString()} {offer.fiatCurrency}
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  {offer.limits.min.toLocaleString()} - {offer.limits.max.toLocaleString()} {offer.fiatCurrency}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {offer.paymentMethods.map((method, index) => (
                                    <Badge key={index} variant="outline" className="bg-background/40 border-white/10 text-white">
                                      {method}
                                    </Badge>
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">
                                  {offer.availableAmount.toFixed(6)} {offer.crypto}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button 
                                    variant="default" 
                                    className="bg-[#F2FF44] text-black hover:bg-[#E2EF34]"
                                    onClick={() => {
                                      setSelectedOffer(offer);
                                      setBuyAmount("");
                                      setBuyTotal(0);
                                      setIsDialogOpen(true);
                                    }}
                                  >
                                    {activeTab === "buy" ? "Buy" : "Sell"}
                                  </Button>

                                  {auth.currentUser && offer.userId === auth.currentUser.uid && (
                                    <Button 
                                      variant="outline" 
                                      onClick={() => openEditDialog(offer)}
                                    >
                                      Edit
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-white/60">
                              No offers found matching your criteria
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="orders" className="mt-0">
                {ordersLoading ? (
                  <div className="bg-background/20 backdrop-blur-lg border border-white/10 rounded-md p-8 flex justify-center items-center">
                    <Loader2 className="h-8 w-8 animate-spin mr-2" />
                    <span>Loading your orders...</span>
                  </div>
                ) : userOrders.length > 0 ? (
                  <div className="bg-background/20 backdrop-blur-lg border border-white/10 rounded-md overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-background/40">
                          <TableHead className="text-white">Order ID</TableHead>
                          <TableHead className="text-white">Type</TableHead>
                          <TableHead className="text-white">Amount</TableHead>
                          <TableHead className="text-white">Total</TableHead>
                          <TableHead className="text-white">Status</TableHead>
                          <TableHead className="text-white">Date</TableHead>
                          <TableHead className="text-white">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userOrders.map((order) => (
                          <TableRow key={order.id} className="hover:bg-background/40">
                            <TableCell className="font-medium">
                              {order.id.substring(0, 8)}...
                            </TableCell>
                            <TableCell>
                              <Badge variant={order.type === 'buy' ? 'default' : 'secondary'}>
                                {order.type === 'buy' ? 'Buy' : 'Sell'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {order.amount.toLocaleString()} {order.fiatCurrency}
                            </TableCell>
                            <TableCell>
                              {order.total.toFixed(8)} {order.crypto}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant="outline" 
                                className={
                                  order.status === 'completed' ? 'bg-green-900/20 text-green-400 border-green-800' :
                                  order.status === 'pending' ? 'bg-yellow-900/20 text-yellow-400 border-yellow-800' :
                                  order.status === 'awaiting_release' ? 'bg-blue-900/20 text-blue-400 border-blue-800' :
                                  order.status === 'cancelled' ? 'bg-red-900/20 text-red-400 border-red-800' :
                                  order.status === 'dispute_opened' ? 'bg-purple-900/20 text-purple-400 border-purple-800' :
                                  'bg-blue-900/20 text-blue-400 border-blue-800'
                                }
                              >
                                {order.status === 'awaiting_release' 
                                  ? 'Awaiting Release' 
                                  : order.status === 'dispute_opened'
                                    ? 'Dispute Opened'
                                    : order.status.charAt(0).toUpperCase() + order.status.slice(1)
                                }
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(order.createdAt).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                {order.status === 'pending' && (
                                  <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={() => handleCancelOrder(order.id)}
                                  >
                                    Cancel
                                  </Button>
                                )}
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => openChat(order.id)}
                                >
                                  <MessageCircle className="h-4 w-4 mr-1" />
                                  Chat
                                </Button>
                                <Button variant="outline" size="sm">
                                  Details
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="bg-background/20 backdrop-blur-lg border border-white/10 rounded-md p-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Clock className="h-12 w-12 mb-4 text-white/40" />
                      <h3 className="text-lg font-medium text-white mb-2">No Orders Yet</h3>
                      <p className="text-white/60 max-w-md mx-auto">
                        You haven't placed any P2P orders yet. Buy or sell crypto with other users to see your orders here.
                      </p>
                      <Button className="mt-4" onClick={() => setActiveTab("buy")}>Start Trading</Button>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="post" className="mt-0">
                <Card className="bg-background/20 backdrop-blur-lg border-white/10">
                  <CardHeader>
                    <CardTitle>Post a New Advertisement</CardTitle>
                    <CardDescription className="text-white/70">
                      Create an offer to buy or sell cryptocurrency
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-white">I want to</Label>
                          <Select value={adType} onValueChange={setAdType}>
                            <SelectTrigger className="bg-background/40 border-white/10 text-white">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="buy">Buy</SelectItem>
                              <SelectItem value="sell">Sell</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-white">Cryptocurrency</Label>
                          <Select value={adCrypto} onValueChange={setAdCrypto}>
                            <SelectTrigger className="bg-background/40 border-white/10 text-white">
                              <SelectValue placeholder="Select crypto" />
                            </SelectTrigger>
                            <SelectContent>
                              {cryptos.map(crypto => (
                                <SelectItem key={crypto} value={crypto}>{crypto}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-white">Payment Currency</Label>
                          <Select value={adFiat} onValueChange={setAdFiat}>
                            <SelectTrigger className="bg-background/40 border-white/10 text-white">
                              <SelectValue placeholder="Select fiat" />
                            </SelectTrigger>
                            <SelectContent>
                              {fiats.map(fiat => (
                                <SelectItem key={fiat} value={fiat}>{fiat}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-white">Payment Method</Label>
                          <Select value={adPayment} onValueChange={setAdPayment}>
                            <SelectTrigger className="bg-background/40 border-white/10 text-white">
                              <SelectValue placeholder="Select payment method" />
                            </SelectTrigger>
                            <SelectContent>
                              {paymentMethods.filter(m => m.id !== "all").map(method => (
                                <SelectItem key={method.id} value={method.id}>{method.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-white">Price Type</Label>
                          <Select value={adPriceType} onValueChange={setAdPriceType}>
                            <SelectTrigger className="bg-background/40 border-white/10 text-white">
                              <SelectValue placeholder="Select price type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="fixed">Fixed Price</SelectItem>
                              <SelectItem value="floating">Floating Price</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-white">Price ({adFiat})</Label>
                          <Input 
                            type="number" 
                            placeholder="Enter price" 
                            className="bg-background/40 border-white/10 text-white placeholder:text-white/50"
                            value={adPrice}
                            onChange={(e) => setAdPrice(e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-white">Available Amount</Label>
                          <Input 
                            type="number" 
                            placeholder="Enter amount" 
                            className="bg-background/40 border-white/10 text-white placeholder:text-white/50"
                            value={adAmount}
                            onChange={(e) => setAdAmount(e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-white">Payment Window (minutes)</Label>
                          <Input 
                            type="number" 
                            placeholder="15" 
                            className="bg-background/40 border-white/10 text-white placeholder:text-white/50"
                            value={adWindow}
                            onChange={(e) => setAdWindow(e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-white">Minimum Limit</Label>
                          <Input 
                            type="number" 
                            placeholder="Enter minimum amount" 
                            className="bg-background/40 border-white/10 text-white placeholder:text-white/50"
                            value={adMinLimit}
                            onChange={(e) => setAdMinLimit(e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-white">Maximum Limit</Label>
                          <Input 
                            type="number" 
                            placeholder="Enter maximum amount" 
                            className="bg-background/40 border-white/10 text-white placeholder:text-white/50"
                            value={adMaxLimit}
                            onChange={(e) => setAdMaxLimit(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white">Terms and Conditions</Label>
                        <Input 
                          placeholder="Add your terms and instructions for the buyer/seller" 
                          className="bg-background/40 border-white/10 text-white placeholder:text-white/50"
                          value={adTerms}
                          onChange={(e) => setAdTerms(e.target.value)}
                        />
                      </div>

                      {/* Payment Details Section */}
                      {/* User Profile Customization Section */}
                      <div className="space-y-2 mt-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-white/70" />
                          <Label className="text-white text-lg">Profile Customization</Label>
                        </div>
                        <p className="text-sm text-white/70 mb-3">
                          Customize how you appear to other users in the P2P marketplace.
                        </p>

                        <div className="flex flex-col md:flex-row gap-4 items-start">
                          <div className="flex flex-col items-center space-y-2">
                            <Avatar className="h-24 w-24 border-2 border-white/10">
                              <AvatarImage src={sellerAvatar} alt={sellerName} />
                              <AvatarFallback>{sellerName.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setShowAvatarSelector(true)}
                              className="text-xs"
                            >
                              Change Avatar
                            </Button>
                          </div>
                          
                          <div className="flex-1 space-y-3">
                            <div className="space-y-1">
                              <Label className="text-white text-sm">Display Name</Label>
                              <Input 
                                placeholder="Enter your display name" 
                                className="bg-background/40 border-white/10 text-white placeholder:text-white/50"
                                value={sellerName}
                                onChange={(e) => {
                                  setSellerName(e.target.value);
                                  // Update avatar URLs that depend on the name
                                  setAvatarOptions(prev => prev.map(option => {
                                    if (["initials", "avataaars", "micah", "adventurer", "lorelei"].includes(option.id)) {
                                      return {
                                        ...option,
                                        imageUrl: option.imageUrl.split("seed=")[0] + "seed=" + e.target.value
                                      };
                                    }
                                    return option;
                                  }));
                                }}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-white text-sm">Trade Completion Rate</Label>
                              <div className="text-xs text-white/70">
                                Your profile will show a high completion rate to build trust.
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="bg-green-900/20 text-green-400 border-green-800">
                                  {(99 + Math.random()).toFixed(1)}% completion
                                </Badge>
                                <Badge variant="outline" className="bg-blue-900/20 text-blue-400 border-blue-800">
                                  Fast response
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Separator className="my-6" />

                      {/* Payment Details Section */}
                      <div className="space-y-2 mt-4">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-5 w-5 text-white/70" />
                          <Label className="text-white text-lg">Payment Details</Label>
                        </div>
                        <p className="text-sm text-white/70 mb-3">
                          Add your payment details for this {adPayment.replace('-', ' ')}. This information will be shown to buyers when they place an order.
                        </p>

                        {/* Payment Instructions field */}
                        <div className="space-y-2">
                          <Label className="text-white text-sm">Payment Instructions</Label>
                          <Input 
                            placeholder="Enter payment instructions" 
                            className="bg-background/40 border-white/10 text-white placeholder:text-white/50 h-9"
                            value={paymentDetails.instructions}
                            onChange={(e) => setPaymentDetails({...paymentDetails, instructions: e.target.value})}
                          />
                        </div>

                        {renderPaymentDetailsFields()}
                      </div>

                      {buyOffers.length === 0 && sellOffers.length === 0 && (
                        <div className="mt-4 p-3 rounded-md bg-yellow-400/10 border border-yellow-400/20 flex items-start space-x-2">
                          <AlertTriangle className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
                          <div className="text-sm text-white/80">
                            <p className="font-medium mb-1">No vendors available yet</p>
                            <p>Start creating real vendors by posting advertisements. You can create buy and sell offers that will appear in the marketplace.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end space-x-4">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setAdPrice("");
                        setAdAmount("");
                        setAdMinLimit("");
                        setAdMaxLimit("");
                        setAdTerms("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      className="bg-[#F2FF44] text-black hover:bg-[#E2EF34]"
                      onClick={handlePostAd}
                      disabled={postingAd}
                    >
                      {postingAd ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Posting...
                        </>
                      ) : "Post Advertisement"}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-background/95 backdrop-blur-xl border-white/10 text-white max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {activeTab === "buy" ? "Buy" : "Sell"} {selectedOffer?.crypto}
              </DialogTitle>
              <DialogDescription className="text-white/70">
                Trading with {selectedOffer?.user.name} ({selectedOffer?.user.rating} <Star className="h-3 w-3 inline fill-current" />)
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
                <div className="bg-background/40 p-3 rounded-md">
                  <div className="flex justify-between mb-1">
                    <span className="text-white/70 text-sm">Price</span>
                    <span className="font-medium text-sm">{selectedOffer?.price.toLocaleString()} {selectedOffer?.fiatCurrency}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-white/70 text-sm">Payment Method</span>
                    <span className="font-medium text-sm">{selectedOffer?.paymentMethods.join(', ')}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-white/70 text-sm">Available</span>
                    <span className="font-medium text-sm">{selectedOffer?.availableAmount.toFixed(6)} {selectedOffer?.crypto}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70 text-sm">Limit</span>
                    <span className="font-medium text-sm">{selectedOffer?.limits.min.toLocaleString()} - {selectedOffer?.limits.max.toLocaleString()} {selectedOffer?.fiatCurrency}</span>
                  </div>
                </div>

                <div className="bg-background/40 p-3 rounded-md">
                  <h4 className="text-sm font-medium mb-1">Advertiser's Terms</h4>
                  <div className="text-xs text-white/80">
                    {selectedOffer?.advertisersTerms || (
                      <>
                        <p>No Third party.</p>
                        <p>{selectedOffer?.paymentMethods[0] === "M-PESA" ? "Mpesa to mpesa" : "Direct bank transfer only."}</p>
                        <p>Neteller, Skrill, remitly accept</p>
                        <p>BANK TRANSFER and PAYBILL available in chat on request.</p>
                        <p>Welcome</p>
                      </>
                    )}
                  </div>
                </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-white text-sm">
                    I want to pay ({selectedOffer?.fiatCurrency})
                  </Label>
                  <Input 
                    type="number" 
                    placeholder={`${selectedOffer?.limits.min.toLocaleString()} - ${selectedOffer?.limits.max.toLocaleString()}`} 
                    className="bg-background/40 border-white/10 text-white placeholder:text-white/50"
                    value={buyAmount}
                    onChange={(e) => {
                      setBuyAmount(e.target.value);
                      setBuyTotal(calculateTotal(e.target.value, selectedOffer?.price || 0));
                    }}
                  />
                </div>

                <div className="p-2 rounded-md bg-accent/20 flex justify-between items-center">
                  <span className="text-white/70 text-sm">You will receive</span>
                  <span className="font-medium text-sm">
                    {buyTotal.toFixed(8)} {selectedOffer?.crypto}
                  </span>
                </div>

                {/* Escrow explanation */}
                <div className="p-3 rounded-md bg-blue-400/10 border border-blue-400/20 flex items-start space-x-2">
                  <ShieldCheck className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-white/80">
                    <p className="font-medium mb-1">Secured by Escrow</p>
                    <p>After confirming this order, the seller's crypto will be locked in escrow. When you complete payment, click "I've Paid" and wait for the seller to verify and release your crypto.</p>
                  </div>
                </div>

                {/* Timeframe warning */}
                <div className="p-3 rounded-md bg-yellow-400/10 border border-yellow-400/20 flex items-start space-x-2">
                  <Clock className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-white/80">
                    <p className="font-medium mb-1">Payment Window: 15 minutes</p>
                    <p>Please complete payment within 15 minutes. Trades not completed in time may be automatically cancelled.</p>
                  </div>
                </div>

                <div className="p-2 rounded-md bg-yellow-400/10 border border-yellow-400/20 flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-white/80">
                    For your security, keep all communication and transactions within the platform.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between gap-4 pt-4 mt-2 sticky bottom-0 bg-background/95">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button 
                className="bg-[#F2FF44] text-black hover:bg-[#E2EF34] flex-1"
                onClick={handleOrderSubmit}
                disabled={processingOrder || !buyAmount}
              >
                {processingOrder ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : `Confirm ${activeTab === "buy" ? "Purchase" : "Sale"}`}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Chat Dialog */}
        <Dialog open={showChatDialog} onOpenChange={setShowChatDialog}>
          <DialogContent className="bg-background/95 backdrop-blur-xl border-white/10 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <MessageCircle className="mr-2 h-5 w-5" />
                Trade Chat
              </DialogTitle>
              <DialogDescription className="text-white/70">
                {selectedOrderForChat && (
                  <>Order ID: {selectedOrderForChat.substring(0, 8)}...</>
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="flex gap-4">
              <div className="h-[400px] flex flex-col flex-1">
                <ScrollArea className="flex-1 pr-4 mb-4">
                  <div className="space-y-4 p-2">
                    {loadingMessages ? (
                      <div className="flex justify-center items-center h-32">
                        <Loader2 className="h-8 w-8 animate-spin text-white/50" />
                        <span className="ml-2 text-white/70">Loading messages...</span>
                      </div>
                    ) : selectedOrderForChat && chatMessages[selectedOrderForChat]?.length > 0 ? (
                      <>
                        {/* Display date separators and messages */}
                        {chatMessages[selectedOrderForChat].map((msg, index) => {
                          // Get current message date
                          const msgDate = new Date(msg.timestamp);
                          const messageDay = msgDate.toLocaleDateString();
                          
                          // Get previous message date
                          const prevMsg = index > 0 ? chatMessages[selectedOrderForChat][index - 1] : null;
                          const prevMsgDay = prevMsg ? new Date(prevMsg.timestamp).toLocaleDateString() : null;
                          
                          // Check if we need to show a date separator
                          const showDateSeparator = messageDay !== prevMsgDay;
                          
                          // Determine if messages are consecutive from same sender
                          const nextMsg = index < chatMessages[selectedOrderForChat].length - 1 
                            ? chatMessages[selectedOrderForChat][index + 1] 
                            : null;
                          const isConsecutive = nextMsg && nextMsg.sender === msg.sender;
                          
                          return (
                            <React.Fragment key={index}>
                              {/* Date separator */}
                              {showDateSeparator && (
                                <div className="flex justify-center my-4">
                                  <div className="text-xs text-white/40 px-2 py-1 bg-background/40 rounded-full">
                                    {messageDay === new Date().toLocaleDateString() 
                                      ? 'Today' 
                                      : messageDay === new Date(Date.now() - 86400000).toLocaleDateString()
                                        ? 'Yesterday'
                                        : messageDay}
                                  </div>
                                </div>
                              )}
                              
                              {/* Message */}
                              <div 
                                className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}
                              >
                                <div 
                                  className={`rounded-lg px-4 py-2 max-w-[80%] ${
                                    msg.sender === 'System' 
                                    ? 'bg-yellow-500/10 text-yellow-300 border border-yellow-500/20' 
                                    : msg.sender === 'You' 
                                      ? 'bg-[#F2FF44]/10 border border-[#F2FF44]/20' 
                                      : 'bg-background/40 border border-white/10'
                                  } ${!isConsecutive ? 'mb-3' : 'mb-1'}`}
                                >
                                  <div className="text-xs text-white/50 mb-1 flex justify-between items-center">
                                    <span>{msg.sender === 'You' ? 'You' : msg.sender}</span>
                                    <span className="ml-4 text-[10px]">{msgDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                  </div>
                                  <div className="whitespace-pre-wrap break-words">{msg.text}</div>
                                </div>
                              </div>
                            </React.Fragment>
                          );
                        })}
                      </>
                    ) : (
                      <div className="text-center p-6 text-white/40">
                        No messages yet. Start the conversation!
                      </div>
                    )}
                  </div>
                </ScrollArea>

                <div className="space-y-2 mt-auto">
                  {selectedOrderForChat && 
                   userOrders.find(o => o.id === selectedOrderForChat)?.status === 'pending' && 
                   userOrders.find(o => o.id === selectedOrderForChat)?.type === 'buy' && (
                    <Button 
                      variant="outline" 
                      className="w-full bg-green-500/20 border-green-500/30 text-green-400 hover:bg-green-500/30 hover:text-green-300"
                      onClick={async () => {
                        try {
                          setProcessingOrder(true);
                          
                          // Confirm with user before proceeding
                          const confirmed = window.confirm(
                            "Please confirm that you have completed the payment. This action cannot be undone. Have you sent the payment exactly as described in the payment details?"
                          );
                          
                          if (!confirmed) {
                            setProcessingOrder(false);
                            return;
                          }
                          
                          // Update order status to awaiting_release
                          await p2pService.updateOrderStatus(selectedOrderForChat, 'awaiting_release');

                          // Messages will be added through the updateOrderStatus method now
                          
                          // Update local order data
                          const updatedOrders = userOrders.map(order => 
                            order.id === selectedOrderForChat 
                              ? {...order, status: 'awaiting_release'} 
                              : order
                          );
                          setUserOrders(updatedOrders);

                          // Refresh chat messages
                          const messages = await p2pService.getChatMessages(selectedOrderForChat);
                          setChatMessages({
                            ...chatMessages,
                            [selectedOrderForChat]: messages
                          });

                          // Play sound for important action
                          const audio = new Audio('/sounds/payment_success.mp3');
                          audio.play().catch(e => console.error("Error playing sound:", e));

                          toast.success("Payment marked as completed", {
                            description: "The seller will verify and release your crypto soon."
                          });
                        } catch (error) {
                          console.error("Error marking payment as completed:", error);
                          toast.error("Failed to mark payment as completed. Please try again.");
                        } finally {
                          setProcessingOrder(false);
                        }
                      }}
                      disabled={processingOrder}
                    >
                      {processingOrder ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          I've Paid
                        </>
                      )}
                    </Button>
                  )}

                  {selectedOrderForChat && 
                   (userOrders.find(o => o.id === selectedOrderForChat)?.status === 'awaiting_release') && 
                   userOrders.find(o => o.id === selectedOrderForChat)?.type === 'sell' && (
                    <Button 
                      variant="outline" 
                      className="w-full bg-green-500/20 border-green-500/30 text-green-400 hover:bg-green-500/30 hover:text-green-300"
                      onClick={async () => {
                        try {
                          setProcessingOrder(true);
                          
                          // Confirm with user before proceeding
                          const confirmed = window.confirm(
                            "Please confirm that you have verified the payment and wish to release the cryptocurrency to the buyer. This action cannot be undone."
                          );
                          
                          if (!confirmed) {
                            setProcessingOrder(false);
                            return;
                          }
                          
                          // Release crypto from escrow and complete order
                          await p2pService.updateOrderStatus(selectedOrderForChat, 'completed');

                          // Update local order data
                          const updatedOrders = userOrders.map(order => 
                            order.id === selectedOrderForChat 
                              ? {...order, status: 'completed'} 
                              : order
                          );
                          setUserOrders(updatedOrders);
                          
                          // Refresh chat messages
                          const messages = await p2pService.getChatMessages(selectedOrderForChat);
                          setChatMessages({
                            ...chatMessages,
                            [selectedOrderForChat]: messages
                          });

                          // Play success sound
                          const audio = new Audio('/sounds/payment_success.mp3');
                          audio.play().catch(e => console.error("Error playing sound:", e));

                          toast.success("Crypto released successfully", {
                            description: "The funds have been transferred to the buyer."
                          });
                        } catch (error) {
                          console.error("Error releasing crypto:", error);
                          toast.error("Failed to release crypto. Please try again.");
                        } finally {
                          setProcessingOrder(false);
                        }
                      }}
                      disabled={processingOrder}
                    >
                      {processingOrder ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Release Crypto
                        </>
                      )}
                    </Button>
                  )}

                  {/* Dispute button */}
                  {selectedOrderForChat && 
                   (userOrders.find(o => o.id === selectedOrderForChat)?.status === 'awaiting_release' || 
                    userOrders.find(o => o.id === selectedOrderForChat)?.status === 'pending') && (
                    <Button 
                      variant="outline" 
                      className="w-full mt-2 bg-yellow-500/20 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/30 hover:text-yellow-300"
                      onClick={() => {
                        toast.warning("Dispute option will be available soon", {
                          description: "Our team is working on implementing the dispute resolution process."
                        });
                      }}
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Open Dispute
                    </Button>
                  )}
                  
                  {/* Auto-refresh toggle */}
                  <div className="flex items-center justify-end space-x-2 text-xs text-white/60 mb-1">
                    <span>Auto-refresh</span>
                    <Switch
                      checked={chatAutoRefresh}
                      onCheckedChange={setChatAutoRefresh}
                      size="sm"
                    />
                  </div>

                  {/* Typing indicator */}
                  {selectedOrderForChat && typingStatus[selectedOrderForChat] && (
                    <div className="flex items-center gap-2 text-xs text-white/60 animate-pulse ml-1 mb-1">
                      <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '600ms' }}></div>
                      </div>
                      <span>
                        {userOrders.find(o => o.id === selectedOrderForChat)?.seller === 'You' 
                          ? userOrders.find(o => o.id === selectedOrderForChat)?.buyer 
                          : userOrders.find(o => o.id === selectedOrderForChat)?.seller} is typing...
                      </span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Input 
                      placeholder="Type your message..." 
                      className="flex-1 bg-background/40 border-white/10 text-white placeholder:text-white/50"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !sendingMessage && sendChatMessage()}
                      disabled={sendingMessage}
                    />
                    <Button 
                      onClick={sendChatMessage}
                      className="bg-[#F2FF44] text-black hover:bg-[#E2EF34]"
                      disabled={sendingMessage}
                    >
                      {sendingMessage ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : "Send"}
                    </Button>
                  </div>

                  {/* Shortcut message buttons */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-xs bg-background/40 border-white/10 hover:bg-background/60"
                      onClick={() => setChatMessage("I've sent the payment, please check.")}
                    >
                      Payment sent
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-xs bg-background/40 border-white/10 hover:bg-background/60"
                      onClick={() => setChatMessage("Thanks for the quick response!")}
                    >
                      Thanks
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-xs bg-background/40 border-white/10 hover:bg-background/60"
                      onClick={() => setChatMessage("Could you please provide more details?")}
                    >
                      More info
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-xs bg-background/40 border-white/10 hover:bg-background/60"
                      onClick={() => setChatMessage("Hi, I need help with this transaction.")}
                    >
                      Help
                    </Button>
                  </div>
                </div>
              </div>

              {/* Payment Details Panel */}
              {selectedOrderForChat && (
                <div className="w-[250px] bg-background/40 border border-white/10 rounded-md p-4 space-y-4">
                  <h3 className="font-medium text-white border-b border-white/10 pb-2">Payment Details</h3>
                  {selectedOrderForChat ? (
                    <div className="space-y-3 text-sm">
                      {/* Display payment method */}
                      <div className="bg-background/60 rounded-md p-2 mb-2 flex items-center">
                        <CreditCard className="h-4 w-4 mr-2 text-white/70" />
                        <span className="font-medium">
                          {userOrders.find(order => order.id === selectedOrderForChat)?.paymentMethod || "M-PESA"}
                        </span>
                      </div>

                      {/* Order amount and crypto */}
                      {userOrders.find(order => order.id === selectedOrderForChat) && (
                        <div className="space-y-1 bg-background/60 rounded-md p-2 mb-2">
                          <div className="text-white/70">Transaction Details</div>
                          <div className="font-medium text-xs">
                            Amount: {userOrders.find(order => order.id === selectedOrderForChat)?.amount.toLocaleString()} {userOrders.find(order => order.id === selectedOrderForChat)?.fiatCurrency}
                          </div>
                          <div className="font-medium text-xs">
                            Crypto: {userOrders.find(order => order.id === selectedOrderForChat)?.total.toFixed(8)} {userOrders.find(order => order.id === selectedOrderForChat)?.crypto}
                          </div>
                        </div>
                      )}

                      {/* Payment instructions if available */}
                      {userOrders.find(order => order.id === selectedOrderForChat)?.paymentDetails?.instructions && (
                        <div className="space-y-1 bg-background/60 rounded-md p-2 mb-2">
                          <div className="text-white/70">Payment Instructions</div>
                          <div className="font-medium text-xs break-words">
                            {userOrders.find(order => order.id === selectedOrderForChat)?.paymentDetails?.instructions}
                          </div>
                        </div>
                      )}

                      {/* Payment details */}
                      {userOrders.find(order => order.id === selectedOrderForChat)?.paymentDetails && 
                       Object.keys(userOrders.find(order => order.id === selectedOrderForChat)?.paymentDetails || {}).length > 0 ? (
                        <div className="space-y-2">
                          {/* Bank Transfer Details */}
                          {userOrders.find(order => order.id === selectedOrderForChat)?.paymentDetails?.bankName && (
                            <div className="space-y-2 bg-background/60 rounded-md p-2">
                              <div className="text-white/70 font-medium">Bank Transfer Details</div>

                              {userOrders.find(order => order.id === selectedOrderForChat)?.paymentDetails?.bankName && (
                                <div className="space-y-1">
                                  <div className="text-white/70 text-xs">Bank Name</div>
                                  <div className="font-medium text-xs break-words flex items-center group relative">
                                    <span className="flex-1 pr-2">{userOrders.find(order => order.id === selectedOrderForChat)?.paymentDetails?.bankName}</span>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => {
                                        navigator.clipboard.writeText(userOrders.find(order => order.id === selectedOrderForChat)?.paymentDetails?.bankName as string);
                                        toast.success(`Bank name copied`);
                                      }}
                                    >
                                      <Copy className="h-3 w-3 text-white/70" />
                                    </Button>
                                  </div>
                                </div>
                              )}

                              {userOrders.find(order => order.id === selectedOrderForChat)?.paymentDetails?.accountNumber && (
                                <div className="space-y-1">
                                  <div className="text-white/70 text-xs">Account Number</div>
                                  <div className="font-medium text-xs break-words flex items-center group relative">
                                    <span className="flex-1 pr-2">{userOrders.find(order => order.id === selectedOrderForChat)?.paymentDetails?.accountNumber}</span>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => {
                                        navigator.clipboard.writeText(userOrders.find(order => order.id === selectedOrderForChat)?.paymentDetails?.accountNumber as string);
                                        toast.success(`Account number copied`);
                                      }}
                                    >
                                      <Copy className="h-3 w-3 text-white/70" />
                                    </Button>
                                  </div>
                                </div>
                              )}

                              {userOrders.find(order => order.id === selectedOrderForChat)?.paymentDetails?.accountHolderName && (
                                <div className="space-y-1">
                                  <div className="text-white/70 text-xs">Account Holder</div>
                                  <div className="font-medium text-xs break-words flex items-center group relative">
                                    <span className="flex-1 pr-2">{userOrders.find(order => order.id === selectedOrderForChat)?.paymentDetails?.accountHolderName}</span>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => {
                                        navigator.clipboard.writeText(userOrders.find(order => order.id === selectedOrderForChat)?.paymentDetails?.accountHolderName as string);
                                        toast.success(`Account holder name copied`);
                                      }}
                                    >
                                      <Copy className="h-3 w-3 text-white/70" />
                                    </Button>
                                  </div>
                                </div>
                              )}

                              {userOrders.find(order => order.id === selectedOrderForChat)?.paymentDetails?.swiftCode && (
                                <div className="space-y-1">
                                  <div className="text-white/70 text-xs">SWIFT/BIC Code</div>
                                  <div className="font-medium text-xs break-words flex items-center group relative">
                                    <span className="flex-1 pr-2">{userOrders.find(order => order.id === selectedOrderForChat)?.paymentDetails?.swiftCode}</span>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => {
                                        navigator.clipboard.writeText(userOrders.find(order => order.id === selectedOrderForChat)?.paymentDetails?.swiftCode as string);
                                        toast.success(`SWIFT code copied`);
                                      }}
                                    >
                                      <Copy className="h-3 w-3 text-white/70" />
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* PayPal Details */}
                          {userOrders.find(order => order.id === selectedOrderForChat)?.paymentDetails?.paypalEmail && (
                            <div className="space-y-2 bg-background/60 rounded-md p-2">
                              <div className="text-white/70 font-medium">PayPal Details</div>

                              <div className="space-y-1">
                                <div className="text-white/70 text-xs">PayPal Email</div>
                                <div className="font-medium text-xs break-words flex items-center group relative">
                                  <span className="flex-1 pr-2">{userOrders.find(order => order.id === selectedOrderForChat)?.paymentDetails?.paypalEmail}</span>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => {
                                      navigator.clipboard.writeText(userOrders.find(order => order.id === selectedOrderForChat)?.paymentDetails?.paypalEmail as string);
                                      toast.success(`PayPal email copied`);
                                    }}
                                  >
                                    <Copy className="h-3 w-3 text-white/70" />
                                  </Button>
                                </div>
                              </div>

                              {userOrders.find(order => order.id === selectedOrderForChat)?.paymentDetails?.paypalName && (
                                <div className="space-y-1">
                                  <div className="text-white/70 text-xs">Full Name</div>
                                  <div className="font-medium text-xs break-words flex items-center group relative">
                                    <span className="flex-1 pr-2">{userOrders.find(order => order.id === selectedOrderForChat)?.paymentDetails?.paypalName}</span>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => {
                                        navigator.clipboard.writeText(userOrders.find(order => order.id === selectedOrderForChat)?.paymentDetails?.paypalName as string);
                                        toast.success(`PayPal name copied`);
                                      }}
                                    >
                                      <Copy className="h-3 w-3 text-white/70" />
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Mobile Money / M-PESA Details */}
                          {userOrders.find(order => order.id === selectedOrderForChat)?.paymentDetails?.mobileNumber && (
                            <div className="space-y-2 bg-background/60 rounded-md p-2">
                              <div className="text-white/70 font-medium">
                                {userOrders.find(order => order.id === selectedOrderForChat)?.paymentMethod?.includes("M-PESA") 
                                  ? "M-PESA Details" 
                                  : "Mobile Money Details"}
                              </div>

                              <div className="space-y-1">
                                <div className="text-white/70 text-xs">Mobile Number</div>
                                <div className="font-medium text-xs break-words flex items-center group relative">
                                  <span className="flex-1 pr-2">{userOrders.find(order => order.id === selectedOrderForChat)?.paymentDetails?.mobileNumber}</span>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => {
                                      navigator.clipboard.writeText(userOrders.find(order => order.id === selectedOrderForChat)?.paymentDetails?.mobileNumber as string);
                                      toast.success(`Mobile number copied`);
                                    }}
                                  >
                                    <Copy className="h-3 w-3 text-white/70" />
                                  </Button>
                                </div>
                              </div>

                              {(userOrders.find(order => order.id === selectedOrderForChat)?.paymentDetails?.mpesaName || 
                                userOrders.find(order => order.id === selectedOrderForChat)?.paymentDetails?.accountName) && (
                                <div className="space-y-1">
                                  <div className="text-white/70 text-xs">Account Name</div>
                                  <div className="font-medium text-xs break-words flex items-center group relative">
                                    <span className="flex-1 pr-2">
                                      {userOrders.find(order => order.id === selectedOrderForChat)?.paymentDetails?.mpesaName || 
                                       userOrders.find(order => order.id === selectedOrderForChat)?.paymentDetails?.accountName}
                                    </span>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => {
                                        navigator.clipboard.writeText(
                                          (userOrders.find(order => order.id === selectedOrderForChat)?.paymentDetails?.mpesaName || 
                                           userOrders.find(order => order.id === selectedOrderForChat)?.paymentDetails?.accountName) as string
                                        );
                                        toast.success(`Account name copied`);
                                      }}
                                    >
                                      <Copy className="h-3 w-3 text-white/70" />
                                    </Button>
                                  </div>
                                </div>
                              )}

                              {userOrders.find(order => order.id === selectedOrderForChat)?.paymentDetails?.mobileProvider && (
                                <div className="space-y-1">
                                  <div className="text-white/70 text-xs">Provider</div>
                                  <div className="font-medium text-xs break-words">
                                    {userOrders.find(order => order.id === selectedOrderForChat)?.paymentDetails?.mobileProvider === "other" 
                                      ? userOrders.find(order => order.id === selectedOrderForChat)?.paymentDetails?.otherProvider 
                                      : userOrders.find(order => order.id === selectedOrderForChat)?.paymentDetails?.mobileProvider}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* If no specific payment details are found, show generic ones */}
                          {!userOrders.find(order => order.id === selectedOrderForChat)?.paymentDetails?.bankName && 
                           !userOrders.find(order => order.id === selectedOrderForChat)?.paymentDetails?.paypalEmail &&
                           !userOrders.find(order => order.id === selectedOrderForChat)?.paymentDetails?.mobileNumber && 
                           Object.keys(userOrders.find(order => order.id === selectedOrderForChat)?.paymentDetails || {}).length > 0 && (
                            <div className="space-y-2">
                              {Object.entries(userOrders.find(order => order.id === selectedOrderForChat)?.paymentDetails || {}).map(([key, value]) => (
                                value && key !== 'instructions' && (
                                  <div key={key} className="space-y-1">
                                    <div className="text-white/70 text-xs">
                                      {key.replace(/([A-Z])/g, ' $1')
                                        .replace(/^./, str => str.toUpperCase())
                                        .replace(/([a-z])([A-Z])/g, '$1 $2')}
                                    </div>
                                    <div className="font-medium text-xs break-words flex items-center group relative">
                                      <span className="flex-1 pr-2">{value as string}</span>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => {
                                          navigator.clipboard.writeText(value as string);
                                          toast.success(`Copied to clipboard`);
                                        }}
                                      >
                                        <Copy className="h-3 w-3 text-white/70" />
                                      </Button>
                                    </div>
                                  </div>
                                )
                              ))}
                            </div>
                           )}
                        </div>
                      ) : (
                        // Payment details should match the details submitted in post ad
                        <div className="bg-background/60 rounded-md p-2">
                          {selectedOrderForChat && 
                           userOrders.find(o => o.id === selectedOrderForChat)?.paymentMethod?.includes("M-PESA") || 
                           userOrders.find(o => o.id === selectedOrderForChat)?.paymentMethod?.includes("Mobile Money") ? (
                            <>
                              <div className="space-y-1">
                                <div className="text-white/70 text-xs">Mobile Number</div>
                                <div className="font-medium text-xs break-words flex items-center group relative">
                                  <span className="flex-1 pr-2">{paymentDetails.mobileNumber || "+254712345678"}</span>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => {
                                      navigator.clipboard.writeText(paymentDetails.mobileNumber || "+254712345678");
                                      toast.success(`Mobile number copied`);
                                    }}
                                  >
                                    <Copy className="h-3 w-3 text-white/70" />
                                  </Button>
                                </div>
                              </div>
                              <div className="space-y-1 mt-2">
                                <div className="text-white/70 text-xs">Account Name</div>
                                <div className="font-medium text-xs break-words flex items-center group relative">
                                  <span className="flex-1 pr-2">
                                    {paymentDetails.mpesaName || paymentDetails.accountName || sellerName}
                                  </span>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => {
                                      navigator.clipboard.writeText(paymentDetails.mpesaName || paymentDetails.accountName || sellerName);
                                      toast.success(`Account name copied`);
                                    }}
                                  >
                                    <Copy className="h-3 w-3 text-white/70" />
                                  </Button>
                                </div>
                              </div>
                              {paymentDetails.mobileProvider && (
                                <div className="space-y-1 mt-2">
                                  <div className="text-white/70 text-xs">Provider</div>
                                  <div className="font-medium text-xs break-words">
                                    {paymentDetails.mobileProvider === "other" 
                                      ? paymentDetails.otherProvider 
                                      : paymentDetails.mobileProvider}
                                  </div>
                                </div>
                              )}
                            </>
                          ) : userOrders.find(o => o.id === selectedOrderForChat)?.paymentMethod?.includes("Bank") ? (
                            <>
                              <div className="space-y-1">
                                <div className="text-white/70 text-xs">Bank Name</div>
                                <div className="font-medium text-xs break-words flex items-center group relative">
                                  <span className="flex-1 pr-2">{paymentDetails.bankName || "Bank of Africa"}</span>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => {
                                      navigator.clipboard.writeText(paymentDetails.bankName || "Bank of Africa");
                                      toast.success(`Bank name copied`);
                                    }}
                                  >
                                    <Copy className="h-3 w-3 text-white/70" />
                                  </Button>
                                </div>
                              </div>
                              <div className="space-y-1 mt-2">
                                <div className="text-white/70 text-xs">Account Number</div>
                                <div className="font-medium text-xs break-words flex items-center group relative">
                                  <span className="flex-1 pr-2">{paymentDetails.accountNumber || "1234567890"}</span>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => {
                                      navigator.clipboard.writeText(paymentDetails.accountNumber || "1234567890");
                                      toast.success(`Account number copied`);
                                    }}
                                  >
                                    <Copy className="h-3 w-3 text-white/70" />
                                  </Button>
                                </div>
                              </div>
                              <div className="space-y-1 mt-2">
                                <div className="text-white/70 text-xs">Account Holder</div>
                                <div className="font-medium text-xs break-words flex items-center group relative">
                                  <span className="flex-1 pr-2">{paymentDetails.accountHolderName || sellerName}</span>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => {
                                      navigator.clipboard.writeText(paymentDetails.accountHolderName || sellerName);
                                      toast.success(`Account holder name copied`);
                                    }}
                                  >
                                    <Copy className="h-3 w-3 text-white/70" />
                                  </Button>
                                </div>
                              </div>
                            </>
                          ) : userOrders.find(o => o.id === selectedOrderForChat)?.paymentMethod?.includes("PayPal") ? (
                            <>
                              <div className="space-y-1">
                                <div className="text-white/70 text-xs">PayPal Email</div>
                                <div className="font-medium text-xs break-words flex items-center group relative">
                                  <span className="flex-1 pr-2">{paymentDetails.paypalEmail || `${sellerName.toLowerCase()}@email.com`}</span>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => {
                                      navigator.clipboard.writeText(paymentDetails.paypalEmail || `${sellerName.toLowerCase()}@email.com`);
                                      toast.success(`PayPal email copied`);
                                    }}
                                  >
                                    <Copy className="h-3 w-3 text-white/70" />
                                  </Button>
                                </div>
                              </div>
                              <div className="space-y-1 mt-2">
                                <div className="text-white/70 text-xs">Full Name</div>
                                <div className="font-medium text-xs break-words flex items-center group relative">
                                  <span className="flex-1 pr-2">{paymentDetails.paypalName || sellerName}</span>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => {
                                      navigator.clipboard.writeText(paymentDetails.paypalName || sellerName);
                                      toast.success(`Full name copied`);
                                    }}
                                  >
                                    <Copy className="h-3 w-3 text-white/70" />
                                  </Button>
                                </div>
                              </div>
                            </>
                          ) : (
                            // Generic details as fallback
                            <>
                              <div className="space-y-1">
                                <div className="text-white/70 text-xs">Payment Method</div>
                                <div className="font-medium text-xs break-words">
                                  {userOrders.find(order => order.id === selectedOrderForChat)?.paymentMethod || "Default Payment Method"}
                                </div>
                              </div>
                              <div className="space-y-1 mt-2">
                                <div className="text-white/70 text-xs">Payment Instructions</div>
                                <div className="font-medium text-xs break-words">
                                  {paymentDetails.instructions || "Please contact the seller for payment details."}
                                </div>
                              </div>
                              <div className="space-y-1 mt-2">
                                <div className="text-white/70 text-xs">Seller</div>
                                <div className="font-medium text-xs break-words">
                                  {userOrders.find(order => order.id === selectedOrderForChat)?.seller || sellerName}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      {/* Reference number */}
                      {userOrders.find(order => order.id === selectedOrderForChat)?.referenceNumber && (
                        <div className="space-y-1 mt-4">
                          <div className="text-white/70">Reference Number</div>
                          <div className="font-medium text-xs break-words bg-yellow-400/10 p-1.5 rounded text-yellow-300 flex items-center group">
                            <span className="flex-1 pr-2">{userOrders.find(order => order.id === selectedOrderForChat)?.referenceNumber}</span>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => {
                                const refNum = userOrders.find(order => order.id === selectedOrderForChat)?.referenceNumber;
                                if (refNum) {
                                  navigator.clipboard.writeText(refNum);
                                  toast.success("Reference number copied");
                                }
                              }}
                            >
                              <Copy className="h-3 w-3 text-white/70" />
                            </Button>
                          </div>
                        </div>
                      )}

                      <div className="p-2 mt-4 bg-background/60 rounded-md">
                        <div className="text-xs text-white/70 mb-1">Copy these details exactly as shown.</div>
                        <div className="text-xs text-white/70">Always verify the payment has been received before releasing crypto.</div>
                      </div>

                      {/* Payment deadline */}
                      {userOrders.find(order => order.id === selectedOrderForChat)?.paymentDeadline && 
                       userOrders.find(order => order.id === selectedOrderForChat)?.status === 'pending' && (
                        <PaymentTimer 
                          deadline={new Date(userOrders.find(order => order.id === selectedOrderForChat)?.paymentDeadline || Date.now())} 
                          onExpire={() => {
                            toast.warning("Payment window is expiring soon", {
                              description: "Please complete your payment to avoid cancellation."
                            });
                            
                            // Play warning sound
                            const audio = new Audio('/sounds/warning.mp3');
                            audio.play().catch(e => console.error("Error playing sound:", e));
                          }}
                        />
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-white/70">
                      No payment details available for this order. Please ask the seller to provide payment information in the chat.
                    </div>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="bg-background/95 backdrop-blur-xl border-white/10 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Advertisement</DialogTitle>
              <DialogDescription className="text-white/70">
                Update your {editingOffer?.type === 'buy' ? 'buy' : 'sell'} offer for {editingOffer?.crypto}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Cryptocurrency</Label>
                  <Select value={adCrypto} onValueChange={setAdCrypto}>
                    <SelectTrigger className="bg-background/40 border-white/10 text-white">
                      <SelectValue placeholder="Select crypto" />
                    </SelectTrigger>
                    <SelectContent>
                      {cryptos.map(crypto => (
                        <SelectItem key={crypto} value={crypto}>{crypto}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Payment Currency</Label>
                  <Select value={adFiat} onValueChange={setAdFiat}>
                    <SelectTrigger className="bg-background/40 border-white/10 text-white">
                      <SelectValue placeholder="Select fiat" />
                    </SelectTrigger>
                    <SelectContent>
                      {fiats.map(fiat => (
                        <SelectItem key={fiat} value={fiat}>{fiat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Payment Method</Label>
                  <Select value={adPayment} onValueChange={setAdPayment}>
                    <SelectTrigger className="bg-background/40 border-white/10 text-white">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.filter(m => m.id !== "all").map(method => (
                        <SelectItem key={method.id} value={method.id}>{method.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Price ({adFiat})</Label>
                  <Input 
                    type="number" 
                    placeholder="Enter price" 
                    className="bg-background/40 border-white/10 text-white placeholder:text-white/50"
                    value={adPrice}
                    onChange={(e) => setAdPrice(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Available Amount</Label>
                  <Input 
                    type="number" 
                    placeholder="Enter amount" 
                    className="bg-background/40 border-white/10 text-white placeholder:text-white/50"
                    value={adAmount}
                    onChange={(e) => setAdAmount(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Payment Window (minutes)</Label>
                  <Input 
                    type="number" 
                    placeholder="15" 
                    className="bg-background/40 border-white/10 text-white placeholder:text-white/50"
                    value={adWindow}
                    onChange={(e) => setAdWindow(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Minimum Limit</Label>
                  <Input 
                    type="number" 
                    placeholder="Enter minimum amount" 
                    className="bg-background/40 border-white/10 text-white placeholder:text-white/50"
                    value={adMinLimit}
                    onChange={(e) => setAdMinLimit(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Maximum Limit</Label>
                  <Input 
                    type="number" 
                    placeholder="Enter maximum amount" 
                    className="bg-background/40 border-white/10 text-white placeholder:text-white/50"
                    value={adMaxLimit}
                    onChange={(e) => setAdMaxLimit(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Terms and Conditions</Label>
                <Input 
                  placeholder="Add your terms and instructions for the buyer/seller" 
                  className="bg-background/40 border-white/10 text-white placeholder:text-white/50"
                  value={adTerms}
                  onChange={(e) => setAdTerms(e.target.value)}
                />
              </div>

              {/* Payment Details Section */}
              <div className="space-y-2 mt-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-white/70" />
                  <Label className="text-white text-lg">Payment Details</Label>
                </div>
                <p className="text-sm text-white/70 mb-3">
                  Add your payment details for this {adPayment.replace('-', ' ')}. This information will be shown to buyers when they place an order.
                </p>
                {renderPaymentDetailsFields()}
              </div>

              <div className="flex justify-end gap-4 pt-4 mt-2">
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  className="bg-[#F2FF44] text-black hover:bg-[#E2EF34]"
                  onClick={handleEditOffer}
                >
                  Update Advertisement
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Avatar Selector Dialog */}
        <Dialog open={showAvatarSelector} onOpenChange={setShowAvatarSelector}>
          <DialogContent className="bg-background/95 backdrop-blur-xl border-white/10 text-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Choose Avatar</DialogTitle>
              <DialogDescription className="text-white/70">
                Select an avatar to represent you in the P2P marketplace
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {avatarOptions.map((avatar) => (
                <div 
                  key={avatar.id}
                  className={`cursor-pointer rounded-lg p-2 transition-all flex flex-col items-center ${
                    selectedAvatarId === avatar.id 
                      ? "bg-primary/20 ring-2 ring-primary" 
                      : "hover:bg-background/40"
                  }`}
                  onClick={() => {
                    setSelectedAvatarId(avatar.id);
                    setSellerAvatar(avatar.imageUrl);
                  }}
                >
                  <Avatar className="h-14 w-14 mx-auto">
                    {avatar.imageUrl ? (
                      <AvatarImage src={avatar.imageUrl} alt={avatar.name} />
                    ) : (
                      <AvatarFallback style={{ backgroundColor: avatar.bgColor }}>
                        {sellerName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <p className="text-xs mt-2 text-center">{avatar.name}</p>
                </div>
              ))}
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowAvatarSelector(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  setShowAvatarSelector(false);
                  toast.success("Avatar updated successfully");
                }}
              >
                Confirm Selection
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default P2PPage;