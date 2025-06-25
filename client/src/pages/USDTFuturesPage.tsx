
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useDashboardContext } from "@/components/dashboard/DashboardLayout";
import TradingViewChart from "@/components/TradingViewChart";
import { CryptoTicker } from "@/components/CryptoTicker";
import { LivePriceTicker } from "@/components/markets/LivePriceTicker";
import { Search, ArrowUp, ArrowDown, ArrowLeftRight, Calculator, ArrowUpRight, Percent, HeartPulse, ChevronDown, ChevronUp, BarChart4, BookOpen, List, LayoutGrid, TriangleAlert } from "lucide-react";
import { toast } from "sonner";

const USDTFuturesPage = () => {
  const { isDemoMode } = useDashboardContext();
  const [selectedTab, setSelectedTab] = useState("trading");
  const [activePair, setActivePair] = useState("BTCUSDT");
  const [orderType, setOrderType] = useState("limit");
  const [leverageValue, setLeverageValue] = useState([10]);
  const [searchQuery, setSearchQuery] = useState("");
  const [positionView, setPositionView] = useState("table");
  const [liquidationPrice, setLiquidationPrice] = useState(0);
  const [orderSide, setOrderSide] = useState("buy");
  const [marginMode, setMarginMode] = useState("cross");
  const [orderPrice, setOrderPrice] = useState("");
  const [orderQuantity, setOrderQuantity] = useState("");

  const futuresPairs = [
    { symbol: "BTCUSDT", price: 55432.87, change: 2.34 },
    { symbol: "ETHUSDT", price: 3020.45, change: 1.27 },
    { symbol: "SOLUSDT", price: 131.28, change: 5.61 },
    { symbol: "BNBUSDT", price: 598.32, change: -0.87 },
    { symbol: "ADAUSDT", price: 0.58, change: -1.23 },
    { symbol: "DOGEUSDT", price: 0.15, change: 8.92 },
    { symbol: "XRPUSDT", price: 0.58, change: 0.32 },
    { symbol: "DOTUSDT", price: 7.42, change: -2.18 },
    { symbol: "AVAXUSDT", price: 35.21, change: 3.45 },
    { symbol: "LINKUSDT", price: 17.89, change: 1.78 }
  ];

  const filteredPairs = futuresPairs.filter(pair => 
    pair.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateMargin = () => {
    if (!orderPrice || !orderQuantity) return 0;
    const price = parseFloat(orderPrice);
    const quantity = parseFloat(orderQuantity);
    if (isNaN(price) || isNaN(quantity)) return 0;
    return (price * quantity) / leverageValue[0];
  };

  const calculateLiquidationPrice = () => {
    if (!orderPrice || !orderQuantity) {
      setLiquidationPrice(0);
      return;
    }
    
    const price = parseFloat(orderPrice);
    const quantity = parseFloat(orderQuantity);
    if (isNaN(price) || isNaN(quantity)) {
      setLiquidationPrice(0);
      return;
    }

    // Simplified liquidation price calculation
    // For long positions: entry_price * (1 - 1/leverage - maintenance_margin)
    // For short positions: entry_price * (1 + 1/leverage + maintenance_margin)
    const maintenanceMargin = 0.005; // 0.5%
    
    if (orderSide === "buy") {
      // Long position
      const liqPrice = price * (1 - 1/leverageValue[0] - maintenanceMargin);
      setLiquidationPrice(parseFloat(liqPrice.toFixed(2)));
    } else {
      // Short position
      const liqPrice = price * (1 + 1/leverageValue[0] + maintenanceMargin);
      setLiquidationPrice(parseFloat(liqPrice.toFixed(2)));
    }
  };

  const handleOrderSubmit = () => {
    if (!orderPrice || !orderQuantity) {
      toast.error("Please enter both price and quantity");
      return;
    }
    
    const price = parseFloat(orderPrice);
    const quantity = parseFloat(orderQuantity);
    if (isNaN(price) || isNaN(quantity)) {
      toast.error("Please enter valid numbers for price and quantity");
      return;
    }
    
    toast.success(`${orderSide === 'buy' ? 'Long' : 'Short'} order placed`, {
      description: `${orderType.toUpperCase()} order to ${orderSide} ${quantity} ${activePair} at ${price} USDT with ${leverageValue[0]}x leverage`
    });
    
    setOrderPrice("");
    setOrderQuantity("");
  };

  // Update liquidation price when relevant values change
  const handlePriceChange = (e) => {
    setOrderPrice(e.target.value);
    calculateLiquidationPrice();
  };

  const handleQuantityChange = (e) => {
    setOrderQuantity(e.target.value);
    calculateLiquidationPrice();
  };

  const handleLeverageChange = (value) => {
    setLeverageValue(value);
    calculateLiquidationPrice();
  };

  const handleSideChange = (side) => {
    setOrderSide(side);
    calculateLiquidationPrice();
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">USDT-M Futures</h1>
            <p className="text-sm text-white/70 mt-1">Trade perpetual futures contracts settled in USDT</p>
          </div>
          {isDemoMode && <div className="text-sm text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-md">Demo Mode</div>}
        </div>

        <CryptoTicker />
        
        <LivePriceTicker />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white md:col-span-3 order-2 md:order-1">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <CardTitle>{activePair}</CardTitle>
                  <Badge 
                    variant="outline"
                    className={`${futuresPairs.find(p => p.symbol === activePair)?.change > 0 ? 'bg-green-900/20 text-green-400 border-green-800' : 'bg-red-900/20 text-red-400 border-red-800'}`}
                  >
                    {futuresPairs.find(p => p.symbol === activePair)?.change > 0 ? '+' : ''}
                    {futuresPairs.find(p => p.symbol === activePair)?.change.toFixed(2)}%
                  </Badge>
                </div>
                <Select defaultValue="1h">
                  <SelectTrigger className="w-[100px] bg-background/40 border-white/10">
                    <SelectValue placeholder="Timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1m">1m</SelectItem>
                    <SelectItem value="5m">5m</SelectItem>
                    <SelectItem value="15m">15m</SelectItem>
                    <SelectItem value="1h">1h</SelectItem>
                    <SelectItem value="4h">4h</SelectItem>
                    <SelectItem value="1d">1d</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] rounded-md overflow-hidden">
                <TradingViewChart 
                  symbol={activePair} 
                  exchange="BINANCE" 
                  containerId="futures_chart"
                />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4 order-1 md:order-2">
            <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
              <CardHeader className="pb-1">
                <CardTitle className="text-base">Markets</CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <div className="relative mb-2">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search pairs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 h-8 bg-background/40 border-white/10"
                  />
                </div>
                <div className="max-h-[300px] overflow-y-auto pr-1">
                  <div className="grid grid-cols-1 gap-1">
                    {filteredPairs.map((pair) => (
                      <Button
                        key={pair.symbol}
                        variant="ghost"
                        className={`w-full justify-between py-1 h-auto ${activePair === pair.symbol ? 'bg-accent/30' : 'hover:bg-accent/20'}`}
                        onClick={() => setActivePair(pair.symbol)}
                      >
                        <span>{pair.symbol}</span>
                        <span className={pair.change > 0 ? 'text-green-400' : 'text-red-400'}>
                          {pair.price.toFixed(pair.price < 1 ? 4 : 2)}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
              <CardHeader className="pb-1">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Trade</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      className={`px-3 py-1 h-6 ${marginMode === 'cross' ? 'bg-accent/30' : 'hover:bg-accent/20'}`}
                      onClick={() => setMarginMode('cross')}
                    >
                      Cross
                    </Button>
                    <Button 
                      variant="ghost" 
                      className={`px-3 py-1 h-6 ${marginMode === 'isolated' ? 'bg-accent/30' : 'hover:bg-accent/20'}`}
                      onClick={() => setMarginMode('isolated')}
                    >
                      Isolated
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="font-medium">Leverage: {leverageValue}x</div>
                    <Button variant="outline" size="sm" className="h-7 px-3">
                      <Calculator className="h-3 w-3 mr-1" />
                      Calculator
                    </Button>
                  </div>
                  
                  <Slider 
                    value={leverageValue} 
                    onValueChange={handleLeverageChange} 
                    min={1} 
                    max={125} 
                    step={1}
                    className="mt-1"
                  />

                  <div className="grid grid-cols-7 gap-1">
                    {[1, 5, 10, 25, 50, 75, 100].map((lev) => (
                      <Button 
                        key={lev}
                        variant="ghost"
                        size="sm"
                        className={`p-0 h-7 ${leverageValue[0] === lev ? 'bg-accent/30' : 'hover:bg-accent/20'}`}
                        onClick={() => setLeverageValue([lev])}
                      >
                        {lev}x
                      </Button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      className={`h-10 ${orderSide === 'buy' ? 'bg-green-600 hover:bg-green-700' : 'bg-background/40 border-white/10 hover:bg-background/60'}`}
                      onClick={() => handleSideChange('buy')}
                    >
                      <ArrowUp className="h-4 w-4 mr-2" />
                      Long
                    </Button>
                    <Button 
                      className={`h-10 ${orderSide === 'sell' ? 'bg-red-600 hover:bg-red-700' : 'bg-background/40 border-white/10 hover:bg-background/60'}`}
                      onClick={() => handleSideChange('sell')}
                    >
                      <ArrowDown className="h-4 w-4 mr-2" />
                      Short
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="orderType">Order Type</Label>
                    </div>
                    <Select value={orderType} onValueChange={setOrderType}>
                      <SelectTrigger id="orderType" className="bg-background/40 border-white/10">
                        <SelectValue placeholder="Select order type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="limit">Limit</SelectItem>
                        <SelectItem value="market">Market</SelectItem>
                        <SelectItem value="stop">Stop</SelectItem>
                        <SelectItem value="trailing">Trailing Stop</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Price (USDT)</Label>
                    <Input 
                      id="price" 
                      type="number" 
                      placeholder="Enter price" 
                      value={orderPrice}
                      onChange={handlePriceChange}
                      className="bg-background/40 border-white/10"
                      disabled={orderType === 'market'}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input 
                      id="quantity" 
                      type="number" 
                      placeholder="Enter quantity" 
                      value={orderQuantity}
                      onChange={handleQuantityChange}
                      className="bg-background/40 border-white/10"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Cost</Label>
                      <div className="bg-background/40 border border-white/10 rounded p-2 text-sm">
                        {calculateMargin().toFixed(2)} USDT
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Liq. Price</Label>
                      <div className="bg-background/40 border border-white/10 rounded p-2 text-sm">
                        {liquidationPrice || '—'} USDT
                      </div>
                    </div>
                  </div>

                  <Button 
                    className={`w-full h-10 ${orderSide === 'buy' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                    onClick={handleOrderSubmit}
                  >
                    {orderSide === 'buy' ? 'Open Long' : 'Open Short'}
                  </Button>

                  <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-md p-2 flex items-start space-x-2">
                    <TriangleAlert className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-white/80">
                      Futures trading involves substantial risk. Leverage can work against you as well as for you.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="positions" className="w-full">
          <TabsList className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
            <TabsTrigger value="positions" className="text-white data-[state=active]:bg-accent">
              Positions
            </TabsTrigger>
            <TabsTrigger value="open-orders" className="text-white data-[state=active]:bg-accent">
              Open Orders
            </TabsTrigger>
            <TabsTrigger value="order-history" className="text-white data-[state=active]:bg-accent">
              Order History
            </TabsTrigger>
            <TabsTrigger value="trade-history" className="text-white data-[state=active]:bg-accent">
              Trade History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="positions" className="mt-4">
            <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle>Current Positions</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className={`h-8 px-2 ${positionView === 'table' ? 'bg-accent/30' : ''}`}
                      onClick={() => setPositionView('table')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className={`h-8 px-2 ${positionView === 'grid' ? 'bg-accent/30' : ''}`}
                      onClick={() => setPositionView('grid')}
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {positionView === 'table' ? (
                  <div className="relative overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-background/40">
                          <TableHead className="text-white">Symbol</TableHead>
                          <TableHead className="text-white">Size</TableHead>
                          <TableHead className="text-white">Entry Price</TableHead>
                          <TableHead className="text-white">Mark Price</TableHead>
                          <TableHead className="text-white">Margin</TableHead>
                          <TableHead className="text-white">PNL (ROE%)</TableHead>
                          <TableHead className="text-white">Liq. Price</TableHead>
                          <TableHead className="text-white"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-white/60">
                            No open positions
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-center w-full h-[200px] rounded-md border border-dashed border-white/20 bg-background/20">
                      <div className="text-center text-white/60">
                        <p>No open positions</p>
                        <p className="text-sm mt-2">Place an order to open a position</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="open-orders" className="mt-4">
            <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
              <CardHeader className="pb-2">
                <CardTitle>Open Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-background/40">
                        <TableHead className="text-white">Symbol</TableHead>
                        <TableHead className="text-white">Type</TableHead>
                        <TableHead className="text-white">Side</TableHead>
                        <TableHead className="text-white">Price</TableHead>
                        <TableHead className="text-white">Amount</TableHead>
                        <TableHead className="text-white">Filled</TableHead>
                        <TableHead className="text-white">Time</TableHead>
                        <TableHead className="text-white"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-white/60">
                          No open orders
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="order-history" className="mt-4">
            <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
              <CardHeader className="pb-2">
                <CardTitle>Order History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-background/40">
                        <TableHead className="text-white">Symbol</TableHead>
                        <TableHead className="text-white">Type</TableHead>
                        <TableHead className="text-white">Side</TableHead>
                        <TableHead className="text-white">Price</TableHead>
                        <TableHead className="text-white">Filled/Amount</TableHead>
                        <TableHead className="text-white">Status</TableHead>
                        <TableHead className="text-white">Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-white/60">
                          No order history
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trade-history" className="mt-4">
            <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
              <CardHeader className="pb-2">
                <CardTitle>Trade History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-background/40">
                        <TableHead className="text-white">Symbol</TableHead>
                        <TableHead className="text-white">Side</TableHead>
                        <TableHead className="text-white">Price</TableHead>
                        <TableHead className="text-white">Quantity</TableHead>
                        <TableHead className="text-white">Fee</TableHead>
                        <TableHead className="text-white">Realized PNL</TableHead>
                        <TableHead className="text-white">Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-white/60">
                          No trade history
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Contract Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-1 border-b border-white/10">
                  <span className="text-white/70">Contract Type</span>
                  <span className="font-medium">Perpetual</span>
                </div>
                <div className="flex justify-between items-center pb-1 border-b border-white/10">
                  <span className="text-white/70">Settlement Asset</span>
                  <span className="font-medium">USDT</span>
                </div>
                <div className="flex justify-between items-center pb-1 border-b border-white/10">
                  <span className="text-white/70">Leverage</span>
                  <span className="font-medium">Up to 125x</span>
                </div>
                <div className="flex justify-between items-center pb-1 border-b border-white/10">
                  <span className="text-white/70">Funding Interval</span>
                  <span className="font-medium">8 hours</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Trading Fee</span>
                  <span className="font-medium">0.04% / 0.02%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Funding Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-1 border-b border-white/10">
                  <span className="text-white/70">Current Rate</span>
                  <span className="font-medium text-green-400">+0.01%</span>
                </div>
                <div className="flex justify-between items-center pb-1 border-b border-white/10">
                  <span className="text-white/70">Next Funding</span>
                  <span className="font-medium">3h 24m</span>
                </div>
                <div className="flex justify-between items-center pb-1 border-b border-white/10">
                  <span className="text-white/70">Countdown</span>
                  <span className="font-medium">03:24:15</span>
                </div>
                <div className="mt-2">
                  <p className="text-xs text-white/70">
                    <span className="text-green-400">Positive rate:</span> Longs pay shorts. <span className="text-red-400">Negative rate:</span> Shorts pay longs.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Insurance Fund</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-1 border-b border-white/10">
                  <span className="text-white/70">Total Balance</span>
                  <span className="font-medium">34,215,879 USDT</span>
                </div>
                <div className="flex justify-between items-center pb-1 border-b border-white/10">
                  <span className="text-white/70">24h Change</span>
                  <span className="font-medium text-green-400">+182,450 USDT</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Purpose</span>
                  <span className="font-medium text-xs">Counterparty protection</span>
                </div>
                <div className="mt-2">
                  <p className="text-xs text-white/70">
                    The Insurance Fund is used to prevent auto-deleveraging in volatile market conditions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default USDTFuturesPage;
