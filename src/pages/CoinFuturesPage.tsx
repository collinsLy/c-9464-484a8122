
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
import { ArrowUp, ArrowDown, ArrowLeftRight, Calculator, ArrowUpRight, Percent, 
         HeartPulse, ChevronDown, ChevronUp, BarChart4, BookOpen, List, LayoutGrid, 
         Info, RefreshCw, TriangleAlert } from "lucide-react";
import { toast } from "sonner";

const CoinFuturesPage = () => {
  const { isDemoMode } = useDashboardContext();
  const [selectedPair, setSelectedPair] = useState("BTC/USD");
  const [leverage, setLeverage] = useState(10);
  const [orderType, setOrderType] = useState("limit");
  const [marginType, setMarginType] = useState("cross");
  const [position, setPosition] = useState("long");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");

  const handlePlaceOrder = () => {
    if (isDemoMode) {
      toast.success("Demo order placed successfully", {
        description: `${position.toUpperCase()} ${amount} ${selectedPair} at ${price} with ${leverage}x leverage`,
      });
    } else {
      toast.error("Please enable demo mode to test this feature");
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="flex-1 w-full md:w-3/4">
            <Card className="border-none shadow-none bg-card/50">
              <CardHeader className="px-0 pt-0">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Select value={selectedPair} onValueChange={setSelectedPair}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select pair" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BTC/USD">BTC/USD</SelectItem>
                        <SelectItem value="ETH/USD">ETH/USD</SelectItem>
                        <SelectItem value="SOL/USD">SOL/USD</SelectItem>
                      </SelectContent>
                    </Select>
                    <Badge variant="outline" className="font-mono">50,233.24</Badge>
                    <Badge variant={position === "long" ? "success" : "destructive"} className="font-mono">
                      {position === "long" ? "+0.33%" : "-0.21%"}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <LayoutGrid className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[500px] rounded-md overflow-hidden">
                  <TradingViewChart symbol="BTCUSD" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="w-full md:w-1/4">
            <Card>
              <CardHeader>
                <CardTitle>Coin-M Futures</CardTitle>
                <CardDescription>Trade with up to 125x leverage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Button 
                    variant={position === "long" ? "default" : "outline"} 
                    className="flex-1" 
                    onClick={() => setPosition("long")}
                  >
                    <ArrowUp className="mr-2 h-4 w-4" /> Long
                  </Button>
                  <Button 
                    variant={position === "short" ? "default" : "outline"} 
                    className="flex-1" 
                    onClick={() => setPosition("short")}
                  >
                    <ArrowDown className="mr-2 h-4 w-4" /> Short
                  </Button>
                </div>

                <Tabs defaultValue="limit">
                  <TabsList className="grid grid-cols-3 w-full">
                    <TabsTrigger value="limit" onClick={() => setOrderType("limit")}>Limit</TabsTrigger>
                    <TabsTrigger value="market" onClick={() => setOrderType("market")}>Market</TabsTrigger>
                    <TabsTrigger value="stop" onClick={() => setOrderType("stop")}>Stop</TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Margin Type</Label>
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="cross-margin">Cross</Label>
                      <Switch 
                        id="cross-margin" 
                        checked={marginType === "isolated"}
                        onCheckedChange={(checked) => setMarginType(checked ? "isolated" : "cross")}
                      />
                      <Label htmlFor="cross-margin">Isolated</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Leverage: {leverage}x</Label>
                  <Slider 
                    value={[leverage]} 
                    min={1} 
                    max={125} 
                    step={1} 
                    onValueChange={(value) => setLeverage(value[0])}
                  />
                  <div className="flex justify-between text-xs">
                    <span>1x</span>
                    <span>25x</span>
                    <span>50x</span>
                    <span>125x</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Amount (BTC)</Label>
                  <Input 
                    type="text" 
                    placeholder="0.00" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                {orderType !== "market" && (
                  <div className="space-y-2">
                    <Label>Price (USD)</Label>
                    <Input 
                      type="text" 
                      placeholder="0.00" 
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Conversion Tools</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm">
                      <ArrowLeftRight className="mr-2 h-4 w-4" /> BTC ↔ USDT
                    </Button>
                    <Button variant="outline" size="sm">
                      <Calculator className="mr-2 h-4 w-4" /> Risk Calc
                    </Button>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  variant={position === "long" ? "success" : "destructive"}
                  onClick={handlePlaceOrder}
                >
                  {position === "long" ? "Buy / Long" : "Sell / Short"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Order Book</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 overflow-auto">
                <div className="space-y-1">
                  {/* Sell orders */}
                  {Array.from({length: 5}).map((_, i) => (
                    <div key={`sell-${i}`} className="flex justify-between text-xs text-red-500">
                      <span className="font-mono">{(50234.50 + (i * 12.50)).toFixed(2)}</span>
                      <span className="font-mono">{(Math.random() * 2).toFixed(4)}</span>
                      <span className="font-mono">{((Math.random() * 2) * (50234.50 + (i * 12.50))).toFixed(2)}</span>
                    </div>
                  ))}
                  
                  <Separator className="my-2" />
                  <div className="text-center font-bold text-sm my-1">50,234.25</div>
                  <Separator className="my-2" />
                  
                  {/* Buy orders */}
                  {Array.from({length: 5}).map((_, i) => (
                    <div key={`buy-${i}`} className="flex justify-between text-xs text-green-500">
                      <span className="font-mono">{(50234.50 - ((i+1) * 12.50)).toFixed(2)}</span>
                      <span className="font-mono">{(Math.random() * 2).toFixed(4)}</span>
                      <span className="font-mono">{((Math.random() * 2) * (50234.50 - ((i+1) * 12.50))).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Funding Rate History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({length: 8}).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>{new Date(Date.now() - i * 8 * 60 * 60 * 1000).toLocaleTimeString()}</TableCell>
                        <TableCell className={i % 2 === 0 ? "text-green-500" : "text-red-500"}>
                          {i % 2 === 0 ? "+" : "-"}0.0{Math.floor(Math.random() * 10)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Position Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 h-48 overflow-auto">
                <div className="flex justify-between text-xs">
                  <span>Entry Price</span>
                  <span className="font-mono">$0.00</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Mark Price</span>
                  <span className="font-mono">$50,234.25</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Liquidation Price</span>
                  <span className="font-mono">$0.00</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Margin Ratio</span>
                  <span className="font-mono">0.00%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Leverage</span>
                  <span className="font-mono">{leverage}x</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Unrealized PNL</span>
                  <span className="font-mono">$0.00</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>ROE</span>
                  <span className="font-mono">0.00%</span>
                </div>
                
                <div className="pt-2">
                  <Button variant="outline" size="sm" className="w-full">
                    <TriangleAlert className="mr-2 h-4 w-4" /> Set Alert
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CoinFuturesPage;
