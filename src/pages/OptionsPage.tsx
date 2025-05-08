
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useDashboardContext } from "@/components/dashboard/DashboardLayout";
import TradingViewChart from "@/components/TradingViewChart";
import { ArrowUp, ArrowDown, Calculator, TrendingUp, TrendingDown, BarChart3, Calendar, ChevronDown, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const OptionsPage = () => {
  const { isDemoMode } = useDashboardContext();
  const [selectedAsset, setSelectedAsset] = useState("BTC");
  const [optionType, setOptionType] = useState("call");
  const [expiryDate, setExpiryDate] = useState("2023-12-29");
  const [strikePrice, setStrikePrice] = useState("50000");
  const [quantity, setQuantity] = useState("1");
  
  // Greeks state
  const [delta, setDelta] = useState(0.65);
  const [gamma, setGamma] = useState(0.02);
  const [theta, setTheta] = useState(-32.45);
  const [vega, setVega] = useState(78.55);

  const handleBuyOption = () => {
    if (isDemoMode) {
      toast.success("Demo option purchased successfully", {
        description: `${optionType.toUpperCase()} ${quantity} ${selectedAsset} @ $${strikePrice} expiring ${expiryDate}`,
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
                    <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Select asset" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BTC">BTC</SelectItem>
                        <SelectItem value="ETH">ETH</SelectItem>
                        <SelectItem value="SOL">SOL</SelectItem>
                      </SelectContent>
                    </Select>
                    <Badge className="font-mono">$50,233.24</Badge>
                    <Badge variant="outline" className="font-mono">IV: 58.24%</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[400px] rounded-md overflow-hidden">
                  <TradingViewChart symbol="BTCUSD" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Options Chain</CardTitle>
                <CardDescription>Select strike price and expiration date</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4 mb-4">
                  <Select value={expiryDate} onValueChange={setExpiryDate}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Expiry Date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2023-11-24">Nov 24, 2023</SelectItem>
                      <SelectItem value="2023-12-01">Dec 1, 2023</SelectItem>
                      <SelectItem value="2023-12-08">Dec 8, 2023</SelectItem>
                      <SelectItem value="2023-12-15">Dec 15, 2023</SelectItem>
                      <SelectItem value="2023-12-22">Dec 22, 2023</SelectItem>
                      <SelectItem value="2023-12-29">Dec 29, 2023</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="flex items-center space-x-2">
                    <Label>Days to Expiry:</Label>
                    <Badge variant="outline">28</Badge>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead colSpan={3} className="text-center bg-muted/50">CALL OPTIONS</TableHead>
                        <TableHead className="text-center">STRIKE</TableHead>
                        <TableHead colSpan={3} className="text-center bg-muted/50">PUT OPTIONS</TableHead>
                      </TableRow>
                      <TableRow>
                        <TableHead className="w-[100px]">Last</TableHead>
                        <TableHead className="w-[100px]">Bid</TableHead>
                        <TableHead className="w-[100px]">Ask</TableHead>
                        <TableHead className="w-[100px] text-center">Price</TableHead>
                        <TableHead className="w-[100px]">Last</TableHead>
                        <TableHead className="w-[100px]">Bid</TableHead>
                        <TableHead className="w-[100px]">Ask</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.from({length: 5}).map((_, i) => {
                        const strikeAmount = 48000 + (i * 1000);
                        const isSelected = strikeAmount.toString() === strikePrice;
                        
                        return (
                          <TableRow 
                            key={i} 
                            className={isSelected ? "bg-primary/10" : ""}
                            onClick={() => setStrikePrice(strikeAmount.toString())}
                          >
                            <TableCell>{(2233.45 - (i * 450)).toFixed(2)}</TableCell>
                            <TableCell>{(2230.00 - (i * 450)).toFixed(2)}</TableCell>
                            <TableCell>{(2235.00 - (i * 450)).toFixed(2)}</TableCell>
                            <TableCell className="text-center font-bold">${strikeAmount.toLocaleString()}</TableCell>
                            <TableCell>{(120.45 + (i * 240)).toFixed(2)}</TableCell>
                            <TableCell>{(118.50 + (i * 240)).toFixed(2)}</TableCell>
                            <TableCell>{(122.00 + (i * 240)).toFixed(2)}</TableCell>
                          </TableRow>
                        );
                      })}
                      <TableRow className="bg-muted/20">
                        <TableCell>{1333.45.toFixed(2)}</TableCell>
                        <TableCell>{1330.00.toFixed(2)}</TableCell>
                        <TableCell>{1335.00.toFixed(2)}</TableCell>
                        <TableCell className="text-center font-bold">$50,000</TableCell>
                        <TableCell>{1220.45.toFixed(2)}</TableCell>
                        <TableCell>{1218.50.toFixed(2)}</TableCell>
                        <TableCell>{1222.00.toFixed(2)}</TableCell>
                      </TableRow>
                      {Array.from({length: 5}).map((_, i) => {
                        const strikeAmount = 51000 + (i * 1000);
                        const isSelected = strikeAmount.toString() === strikePrice;
                        
                        return (
                          <TableRow 
                            key={i + 6} 
                            className={isSelected ? "bg-primary/10" : ""}
                            onClick={() => setStrikePrice(strikeAmount.toString())}
                          >
                            <TableCell>{(833.45 - (i * 150)).toFixed(2)}</TableCell>
                            <TableCell>{(830.00 - (i * 150)).toFixed(2)}</TableCell>
                            <TableCell>{(835.00 - (i * 150)).toFixed(2)}</TableCell>
                            <TableCell className="text-center font-bold">${strikeAmount.toLocaleString()}</TableCell>
                            <TableCell>{(1520.45 + (i * 340)).toFixed(2)}</TableCell>
                            <TableCell>{(1518.50 + (i * 340)).toFixed(2)}</TableCell>
                            <TableCell>{(1522.00 + (i * 340)).toFixed(2)}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="w-full md:w-1/4">
            <Card>
              <CardHeader>
                <CardTitle>Option Trade</CardTitle>
                <CardDescription>Configure your option position</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Button 
                    variant={optionType === "call" ? "default" : "outline"} 
                    className="flex-1" 
                    onClick={() => setOptionType("call")}
                  >
                    <ArrowUp className="mr-2 h-4 w-4" /> Call
                  </Button>
                  <Button 
                    variant={optionType === "put" ? "default" : "outline"} 
                    className="flex-1" 
                    onClick={() => setOptionType("put")}
                  >
                    <ArrowDown className="mr-2 h-4 w-4" /> Put
                  </Button>
                </div>
                
                <Tabs defaultValue="buy">
                  <TabsList className="grid grid-cols-2 w-full">
                    <TabsTrigger value="buy">Buy</TabsTrigger>
                    <TabsTrigger value="write">Write</TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="space-y-2">
                  <Label>Strike Price (USD)</Label>
                  <Input 
                    type="text" 
                    value={strikePrice}
                    onChange={(e) => setStrikePrice(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Expiry Date</Label>
                  <Select value={expiryDate} onValueChange={setExpiryDate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2023-11-24">Nov 24, 2023</SelectItem>
                      <SelectItem value="2023-12-01">Dec 1, 2023</SelectItem>
                      <SelectItem value="2023-12-08">Dec 8, 2023</SelectItem>
                      <SelectItem value="2023-12-15">Dec 15, 2023</SelectItem>
                      <SelectItem value="2023-12-22">Dec 22, 2023</SelectItem>
                      <SelectItem value="2023-12-29">Dec 29, 2023</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input 
                    type="text" 
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>

                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Premium per Contract</Label>
                    <span className="font-mono">$1,333.45</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <Label>Total Premium</Label>
                    <span className="font-mono">${(1333.45 * Number(quantity || 0)).toFixed(2)}</span>
                  </div>
                </div>

                <Separator />
                
                <div>
                  <h4 className="font-medium mb-2">The Greeks</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Delta (Δ)</span>
                      <span className="font-mono text-sm">{delta.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Gamma (Γ)</span>
                      <span className="font-mono text-sm">{gamma.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Theta (Θ)</span>
                      <span className="font-mono text-sm">{theta.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Vega (V)</span>
                      <span className="font-mono text-sm">{vega.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  variant={optionType === "call" ? "default" : "destructive"}
                  onClick={handleBuyOption}
                >
                  Buy {optionType === "call" ? "Call" : "Put"} Option
                </Button>
              </CardContent>
            </Card>
            
            <Card className="mt-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Strategy Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <ArrowUp className="mr-2 h-4 w-4" /> Bull Call Spread
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <ArrowDown className="mr-2 h-4 w-4" /> Bear Put Spread
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <TrendingUp className="mr-2 h-4 w-4" /> Covered Call
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <TrendingDown className="mr-2 h-4 w-4" /> Protective Put
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <BarChart3 className="mr-2 h-4 w-4" /> Iron Condor
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <AlertTriangle className="mr-2 h-4 w-4" /> Long Straddle
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OptionsPage;
