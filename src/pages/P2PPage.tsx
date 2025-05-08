
import { useState } from "react";
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
import { Search, Filter, ChevronDown, MessageCircle, ShieldCheck, ArrowUpRight, Star, Clock, CreditCard, Users, DollarSign, ArrowRight, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface P2POffer {
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
}

const P2PPage = () => {
  const { isDemoMode } = useDashboardContext();
  const [activeTab, setActiveTab] = useState("buy");
  const [selectedCrypto, setSelectedCrypto] = useState("BTC");
  const [selectedFiat, setSelectedFiat] = useState("USD");
  const [selectedPayment, setSelectedPayment] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<P2POffer | null>(null);
  const [buyAmount, setBuyAmount] = useState("");
  const [buyTotal, setBuyTotal] = useState(0);

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

  const buyOffers: P2POffer[] = [
    {
      id: "1",
      user: {
        name: "CryptoMaster",
        avatar: "https://github.com/shadcn.png",
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
      terms: "Payment must be completed within 15 minutes. Please include transaction reference."
    },
    {
      id: "2",
      user: {
        name: "AfricaTrader",
        avatar: "https://github.com/shadcn.png",
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
      terms: "M-PESA transactions will be processed immediately. I'm available 24/7."
    },
    {
      id: "3",
      user: {
        name: "CryptoPro",
        avatar: "https://github.com/shadcn.png",
        rating: 5.0,
        completedTrades: 219
      },
      crypto: "BTC",
      price: 55380.20,
      fiatCurrency: "USD",
      paymentMethods: ["Bank Transfer", "Credit/Debit Card"],
      limits: {
        min: 200,
        max: 20000
      },
      availableAmount: 1.2,
      terms: "Fast release once payment is verified. No additional fees."
    },
    {
      id: "4",
      user: {
        name: "StellarTrader",
        avatar: "https://github.com/shadcn.png",
        rating: 4.8,
        completedTrades: 178
      },
      crypto: "ETH",
      price: 3010.25,
      fiatCurrency: "USD",
      paymentMethods: ["Bank Transfer", "PayPal", "M-PESA"],
      limits: {
        min: 100,
        max: 8000
      },
      availableAmount: 5.5,
      terms: "I process payments quickly. Please ensure your payment details are correct."
    }
  ];

  const sellOffers: P2POffer[] = [
    {
      id: "5",
      user: {
        name: "BlockchainBaron",
        avatar: "https://github.com/shadcn.png",
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
      terms: "Release after payment confirmation. I usually respond within 5 minutes."
    },
    {
      id: "6",
      user: {
        name: "NairaTrader",
        avatar: "https://github.com/shadcn.png",
        rating: 4.8,
        completedTrades: 95
      },
      crypto: "BTC",
      price: 55750.80,
      fiatCurrency: "USD",
      paymentMethods: ["Mobile Money", "M-PESA"],
      limits: {
        min: 50,
        max: 5000
      },
      availableAmount: 0.35,
      terms: "Fast and reliable service. No hidden fees."
    }
  ];

  const filteredOffers = (activeTab === "buy" ? buyOffers : sellOffers).filter(offer => {
    if (selectedCrypto !== "all" && offer.crypto !== selectedCrypto) return false;
    if (selectedFiat !== "all" && offer.fiatCurrency !== selectedFiat) return false;
    if (selectedPayment !== "all" && !offer.paymentMethods.some(method => method.toLowerCase().includes(selectedPayment.toLowerCase()))) return false;
    if (searchQuery && !offer.user.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleBuySubmit = () => {
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
    
    toast.success("Order placed successfully", {
      description: `Your order to ${activeTab} ${(amount / selectedOffer.price).toFixed(8)} ${selectedOffer.crypto} has been placed.`
    });
    
    setIsDialogOpen(false);
  };

  const calculateTotal = (amount: string, price: number) => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return 0;
    return numAmount / price;
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">P2P Trading</h1>
            <p className="text-sm text-white/70 mt-1">Buy and sell crypto directly with other users</p>
          </div>
          {isDemoMode && <div className="text-sm text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-md">Demo Mode</div>}
        </div>

        <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
          <CardHeader>
            <CardTitle>P2P Market</CardTitle>
            <CardDescription className="text-white/70">
              Trade cryptocurrencies directly with other users using your preferred payment methods
            </CardDescription>
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
                      {filteredOffers.length > 0 ? (
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

              <TabsContent value="orders" className="mt-4">
                <div className="bg-background/20 backdrop-blur-lg border border-white/10 rounded-md p-8 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <Clock className="h-12 w-12 mb-4 text-white/40" />
                    <h3 className="text-lg font-medium text-white mb-2">No Orders Yet</h3>
                    <p className="text-white/60 max-w-md mx-auto">
                      You haven't placed any P2P orders yet. Buy or sell crypto with other users to see your orders here.
                    </p>
                    <Button className="mt-4">Start Trading</Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="post" className="mt-4">
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
                          <Select defaultValue="buy">
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
                          <Select defaultValue="BTC">
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
                          <Select defaultValue="USD">
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
                          <Select defaultValue="bank-transfer">
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
                          <Select defaultValue="floating">
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
                          <Label>Price (USD)</Label>
                          <Input 
                            type="number" 
                            placeholder="Enter price" 
                            className="bg-background/40 border-white/10"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Available Amount</Label>
                          <Input 
                            type="number" 
                            placeholder="Enter amount" 
                            className="bg-background/40 border-white/10"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Payment Window (minutes)</Label>
                          <Input 
                            type="number" 
                            placeholder="15" 
                            className="bg-background/40 border-white/10"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Minimum Limit</Label>
                          <Input 
                            type="number" 
                            placeholder="Enter minimum amount" 
                            className="bg-background/40 border-white/10"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Maximum Limit</Label>
                          <Input 
                            type="number" 
                            placeholder="Enter maximum amount" 
                            className="bg-background/40 border-white/10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Terms and Conditions</Label>
                        <Input 
                          placeholder="Add your terms and instructions for the buyer/seller" 
                          className="bg-background/40 border-white/10"
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end space-x-4">
                    <Button variant="outline">Cancel</Button>
                    <Button className="bg-[#F2FF44] text-black hover:bg-[#E2EF34]">
                      Post Advertisement
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
                  onClick={handleBuySubmit}
                >
                  Confirm {activeTab === "buy" ? "Purchase" : "Sale"}
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
