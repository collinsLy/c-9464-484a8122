
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useDashboardContext } from "@/components/dashboard/DashboardLayout";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Search, Filter, ChevronDown, MessageCircle, ShieldCheck, ArrowUpRight, Star, Clock, CreditCard, Users, DollarSign, ArrowRight, AlertTriangle, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import p2pService, { P2POffer, P2POrder } from "@/lib/p2p-service";

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
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [processingOrder, setProcessingOrder] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
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
    loadOffers();
    loadUserOrders();
    loadCurrentPrices();
    
    // Set up interval to refresh prices every minute
    const priceInterval = setInterval(() => {
      loadCurrentPrices();
    }, 60000); // 1 minute
    
    return () => clearInterval(priceInterval);
  }, []);

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
      const orders = await p2pService.getUserOrders();
      setUserOrders(orders);
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
    
    setProcessingOrder(true);
    
    try {
      await p2pService.placeOrder(
        selectedOffer.id,
        amount,
        activeTab as 'buy' | 'sell'
      );
      
      toast.success("Order placed successfully", {
        description: `Your order to ${activeTab} ${(amount / selectedOffer.price).toFixed(8)} ${selectedOffer.crypto} has been placed.`
      });
      
      // Reload orders and offers
      loadOffers();
      loadUserOrders();
      
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error(error instanceof Error ? error.message : "Failed to place order. Please try again.");
    } finally {
      setProcessingOrder(false);
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
    
    setPostingAd(true);
    
    try {
      // Convert payment method ID to name
      const paymentMethodName = paymentMethods.find(m => m.id === adPayment)?.name || adPayment;
      
      const newOffer: Omit<P2POffer, 'id' | 'createdAt'> = {
        user: {
          name: "You", // Would be fetched from user profile in a real app
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=You",
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
        terms: adTerms || "Standard terms apply."
      };
      
      await p2pService.createP2POffer(newOffer);
      
      toast.success("Advertisement posted successfully");
      
      // Reset form
      setAdPrice("");
      setAdAmount("");
      setAdMinLimit("");
      setAdMaxLimit("");
      setAdTerms("");
      
      // Reload offers
      loadOffers();
      
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

  const filteredOffers = activeTab === "buy" ? buyOffers : sellOffers;

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
                                      {offer.user.completedTrades}+ trades
                                    </div>
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
                                      {offer.user.completedTrades}+ trades
                                    </div>
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
                                  order.status === 'cancelled' ? 'bg-red-900/20 text-red-400 border-red-800' :
                                  'bg-blue-900/20 text-blue-400 border-blue-800'
                                }
                              >
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
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
                          <Label>I want to</Label>
                          <Select value={adType} onValueChange={setAdType}>
                            <SelectTrigger className="bg-background/40 border-white/10">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="buy">Buy</SelectItem>
                              <SelectItem value="sell">Sell</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Cryptocurrency</Label>
                          <Select value={adCrypto} onValueChange={setAdCrypto}>
                            <SelectTrigger className="bg-background/40 border-white/10">
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
                          <Label>Payment Currency</Label>
                          <Select value={adFiat} onValueChange={setAdFiat}>
                            <SelectTrigger className="bg-background/40 border-white/10">
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
                          <Label>Payment Method</Label>
                          <Select value={adPayment} onValueChange={setAdPayment}>
                            <SelectTrigger className="bg-background/40 border-white/10">
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
                          <Label>Price Type</Label>
                          <Select value={adPriceType} onValueChange={setAdPriceType}>
                            <SelectTrigger className="bg-background/40 border-white/10">
                              <SelectValue placeholder="Select price type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="fixed">Fixed Price</SelectItem>
                              <SelectItem value="floating">Floating Price</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Price ({adFiat})</Label>
                          <Input 
                            type="number" 
                            placeholder="Enter price" 
                            className="bg-background/40 border-white/10"
                            value={adPrice}
                            onChange={(e) => setAdPrice(e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Available Amount</Label>
                          <Input 
                            type="number" 
                            placeholder="Enter amount" 
                            className="bg-background/40 border-white/10"
                            value={adAmount}
                            onChange={(e) => setAdAmount(e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Payment Window (minutes)</Label>
                          <Input 
                            type="number" 
                            placeholder="15" 
                            className="bg-background/40 border-white/10"
                            value={adWindow}
                            onChange={(e) => setAdWindow(e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Minimum Limit</Label>
                          <Input 
                            type="number" 
                            placeholder="Enter minimum amount" 
                            className="bg-background/40 border-white/10"
                            value={adMinLimit}
                            onChange={(e) => setAdMinLimit(e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Maximum Limit</Label>
                          <Input 
                            type="number" 
                            placeholder="Enter maximum amount" 
                            className="bg-background/40 border-white/10"
                            value={adMaxLimit}
                            onChange={(e) => setAdMaxLimit(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Terms and Conditions</Label>
                        <Input 
                          placeholder="Add your terms and instructions for the buyer/seller" 
                          className="bg-background/40 border-white/10"
                          value={adTerms}
                          onChange={(e) => setAdTerms(e.target.value)}
                        />
                      </div>
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
          <DialogContent className="bg-background/95 backdrop-blur-xl border-white/10 text-white">
            <DialogHeader>
              <DialogTitle>
                {activeTab === "buy" ? "Buy" : "Sell"} {selectedOffer?.crypto}
              </DialogTitle>
              <DialogDescription className="text-white/70">
                Trading with {selectedOffer?.user.name} ({selectedOffer?.user.rating} <Star className="h-3 w-3 inline fill-current" />)
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="bg-background/40 p-4 rounded-md">
                <div className="flex justify-between mb-2">
                  <span className="text-white/70">Price</span>
                  <span className="font-medium">{selectedOffer?.price.toLocaleString()} {selectedOffer?.fiatCurrency}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-white/70">Payment Method</span>
                  <span className="font-medium">{selectedOffer?.paymentMethods.join(', ')}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-white/70">Available</span>
                  <span className="font-medium">{selectedOffer?.availableAmount.toFixed(6)} {selectedOffer?.crypto}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Limit</span>
                  <span className="font-medium">{selectedOffer?.limits.min.toLocaleString()} - {selectedOffer?.limits.max.toLocaleString()} {selectedOffer?.fiatCurrency}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>
                    I want to pay ({selectedOffer?.fiatCurrency})
                  </Label>
                  <Input 
                    type="number" 
                    placeholder={`${selectedOffer?.limits.min.toLocaleString()} - ${selectedOffer?.limits.max.toLocaleString()}`} 
                    className="bg-background/40 border-white/10"
                    value={buyAmount}
                    onChange={(e) => {
                      setBuyAmount(e.target.value);
                      setBuyTotal(calculateTotal(e.target.value, selectedOffer?.price || 0));
                    }}
                  />
                </div>

                <div className="p-3 rounded-md bg-accent/20 flex justify-between items-center">
                  <span className="text-white/70">You will receive</span>
                  <span className="font-medium">
                    {buyTotal.toFixed(8)} {selectedOffer?.crypto}
                  </span>
                </div>

                <div className="space-y-2 bg-background/40 p-4 rounded-md">
                  <h4 className="font-medium mb-2">Terms and Conditions</h4>
                  <p className="text-sm text-white/80">{selectedOffer?.terms}</p>
                </div>

                <div className="p-3 rounded-md bg-yellow-400/10 border border-yellow-400/20 flex items-start space-x-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-white/80">
                    For your security, keep all communication and transactions within the platform. Never share your payment details outside the escrow system.
                  </p>
                </div>
              </div>

              <div className="flex justify-between gap-4">
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
            </div>
          </DialogContent>
        </Dialog>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Security Tips</CardTitle>
              <ShieldCheck className="h-5 w-5 text-green-400" />
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
                  <span>Always use the escrow service for protection</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
                  <span>Keep all communications within the platform</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
                  <span>Verify user ratings before trading</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
                  <span>Report suspicious behavior immediately</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Escrow Protection</CardTitle>
              <ShieldCheck className="h-5 w-5 text-green-400" />
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>All P2P trades are protected by our secure escrow service:</p>
              <ol className="space-y-2 list-decimal pl-4">
                <li>Seller's crypto is locked in escrow</li>
                <li>Buyer sends payment directly to seller</li>
                <li>Seller confirms payment receipt</li>
                <li>Escrow releases crypto to buyer</li>
              </ol>
              <Button variant="link" className="p-0 h-auto text-accent">Learn more about escrow</Button>
            </CardContent>
          </Card>

          <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Community Standards</CardTitle>
              <Users className="h-5 w-5 text-blue-400" />
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>Our P2P marketplace thrives on trust and reliability:</p>
              <ul className="space-y-2">
                <li className="flex gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
                  <span>Complete trades promptly</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
                  <span>Maintain clear communication</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
                  <span>Provide honest feedback</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
                  <span>Respect payment time windows</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default P2PPage;
