
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useDashboardContext } from "@/components/dashboard/DashboardLayout";
import { Calculator, Percent, ArrowRight, Clock, Calendar, ArrowUpRight, RefreshCw, Info, Lock, Unlock } from "lucide-react";
import { toast } from "sonner";

const SimpleEarnPage = () => {
  const { isDemoMode } = useDashboardContext();
  const [earnType, setEarnType] = useState("flexible");
  const [selectedAsset, setSelectedAsset] = useState("BTC");
  const [amount, setAmount] = useState("");
  const [duration, setDuration] = useState("30");
  const [autoRenew, setAutoRenew] = useState(true);

  const handleSubscribe = () => {
    if (isDemoMode) {
      toast.success("Successfully subscribed to earn product", {
        description: `${amount} ${selectedAsset} staked for ${earnType === "flexible" ? "flexible period" : `${duration} days`}`,
      });
    } else {
      toast.error("Please enable demo mode to test this feature");
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="w-full md:w-2/3">
            <Card>
              <CardHeader>
                <CardTitle>Simple Earn</CardTitle>
                <CardDescription>Earn interest on your crypto assets</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue={earnType} onValueChange={setEarnType}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="flexible">Flexible</TabsTrigger>
                    <TabsTrigger value="locked">Locked</TabsTrigger>
                  </TabsList>
                  <TabsContent value="flexible" className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Select Asset</Label>
                      <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select asset" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                          <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                          <SelectItem value="USDT">Tether (USDT)</SelectItem>
                          <SelectItem value="USDC">USD Coin (USDC)</SelectItem>
                          <SelectItem value="SOL">Solana (SOL)</SelectItem>
                          <SelectItem value="DOT">Polkadot (DOT)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="rounded-md border p-4">
                      <div className="flex justify-between">
                        <div>
                          <h4 className="font-medium">Flexible Bitcoin Savings</h4>
                          <p className="text-sm text-muted-foreground">No lock-up period, withdraw anytime</p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-2xl text-green-500">3.5%</div>
                          <div className="text-sm text-muted-foreground">Estimated APY</div>
                        </div>
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                          <span>Minimum Purchase</span>
                          <span className="font-mono">0.0001 BTC</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span>Est. Daily Interest</span>
                          <span className="font-mono">0.0000095 BTC per 1 BTC</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span>Interest Distribution</span>
                          <span>Daily</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Subscription Amount</Label>
                      <div className="relative">
                        <Input 
                          type="text" 
                          placeholder="0.00" 
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <span className="text-sm font-medium">{selectedAsset}</span>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Available: {isDemoMode ? "0.1482 BTC" : "0.00 BTC"}</span>
                        <Button variant="ghost" size="sm" className="h-5 p-0">MAX</Button>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <Button className="w-full" onClick={handleSubscribe}>
                        Subscribe Now
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="locked" className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Select Asset</Label>
                      <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select asset" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                          <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                          <SelectItem value="USDT">Tether (USDT)</SelectItem>
                          <SelectItem value="USDC">USD Coin (USDC)</SelectItem>
                          <SelectItem value="SOL">Solana (SOL)</SelectItem>
                          <SelectItem value="DOT">Polkadot (DOT)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Lock-up Duration</Label>
                      <RadioGroup value={duration} onValueChange={setDuration} className="grid grid-cols-3 gap-4">
                        <Label
                          htmlFor="r30"
                          className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 cursor-pointer hover:bg-accent hover:text-accent-foreground ${duration === "30" ? "border-primary" : ""}`}
                        >
                          <RadioGroupItem value="30" id="r30" className="sr-only" />
                          <span className="block text-xl font-bold">30</span>
                          <span className="block text-xs">Days</span>
                          <span className="mt-1 block text-xs font-medium">4.5% APY</span>
                        </Label>
                        <Label
                          htmlFor="r60"
                          className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 cursor-pointer hover:bg-accent hover:text-accent-foreground ${duration === "60" ? "border-primary" : ""}`}
                        >
                          <RadioGroupItem value="60" id="r60" className="sr-only" />
                          <span className="block text-xl font-bold">60</span>
                          <span className="block text-xs">Days</span>
                          <span className="mt-1 block text-xs font-medium">5.2% APY</span>
                        </Label>
                        <Label
                          htmlFor="r90"
                          className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 cursor-pointer hover:bg-accent hover:text-accent-foreground ${duration === "90" ? "border-primary" : ""}`}
                        >
                          <RadioGroupItem value="90" id="r90" className="sr-only" />
                          <span className="block text-xl font-bold">90</span>
                          <span className="block text-xs">Days</span>
                          <span className="mt-1 block text-xs font-medium">6.8% APY</span>
                        </Label>
                      </RadioGroup>
                    </div>
                    
                    <div className="rounded-md border p-4">
                      <div className="flex justify-between">
                        <div>
                          <h4 className="font-medium">Locked Bitcoin Savings</h4>
                          <p className="text-sm text-muted-foreground">{duration} days lock-up period</p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-2xl text-green-500">
                            {duration === "30" ? "4.5%" : duration === "60" ? "5.2%" : "6.8%"}
                          </div>
                          <div className="text-sm text-muted-foreground">Fixed APY</div>
                        </div>
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                          <span>Redemption Period</span>
                          <span>{new Date(Date.now() + parseInt(duration) * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span>Early Redemption</span>
                          <span>Not Available</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span>Interest Distribution</span>
                          <span>At Maturity</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Subscription Amount</Label>
                      <div className="relative">
                        <Input 
                          type="text" 
                          placeholder="0.00" 
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <span className="text-sm font-medium">{selectedAsset}</span>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Available: {isDemoMode ? "0.1482 BTC" : "0.00 BTC"}</span>
                        <Button variant="ghost" size="sm" className="h-5 p-0">MAX</Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="auto-renew" 
                        checked={autoRenew}
                        onCheckedChange={setAutoRenew}
                      />
                      <Label htmlFor="auto-renew">Auto-renew at maturity</Label>
                    </div>
                    
                    <div className="pt-2">
                      <Button className="w-full" onClick={handleSubscribe}>
                        Subscribe Now
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Interest Calculator</CardTitle>
                <CardDescription>Estimate your potential earnings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-1/2 space-y-4">
                    <div className="space-y-2">
                      <Label>Asset</Label>
                      <Select defaultValue="BTC">
                        <SelectTrigger>
                          <SelectValue placeholder="Select asset" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                          <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                          <SelectItem value="USDT">Tether (USDT)</SelectItem>
                          <SelectItem value="USDC">USD Coin (USDC)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Amount</Label>
                      <Input type="text" placeholder="0.00" defaultValue="1" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Duration (Days)</Label>
                      <Slider defaultValue={[30]} min={1} max={90} step={1} />
                      <div className="flex justify-between text-xs">
                        <span>1 Day</span>
                        <span>30 Days</span>
                        <span>60 Days</span>
                        <span>90 Days</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Product Type</Label>
                      <Select defaultValue="locked">
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="flexible">Flexible Savings</SelectItem>
                          <SelectItem value="locked">Locked Savings</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Button variant="outline" className="w-full">
                      <Calculator className="mr-2 h-4 w-4" />
                      Calculate
                    </Button>
                  </div>
                  
                  <div className="w-full md:w-1/2 border rounded-md p-4">
                    <h3 className="font-medium mb-4">Estimated Earnings</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Est. APY</span>
                        <span className="font-bold text-green-500">6.8%</span>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Daily Interest</span>
                        <span className="font-mono">0.000186 BTC</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Monthly Interest</span>
                        <span className="font-mono">0.00558 BTC</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Yearly Interest</span>
                        <span className="font-mono">0.068 BTC</span>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Initial Investment</span>
                        <span className="font-mono">1.00 BTC</span>
                      </div>
                      
                      <div className="flex justify-between items-center font-bold">
                        <span>Total Value (30 Days)</span>
                        <span className="font-mono text-green-500">1.0186 BTC</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="w-full md:w-1/3">
            <Card>
              <CardHeader>
                <CardTitle>My Earn Assets</CardTitle>
                <CardDescription>Currently earning interest</CardDescription>
              </CardHeader>
              <CardContent>
                {isDemoMode ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                          <span className="text-xs font-bold text-orange-500">BTC</span>
                        </div>
                        <div>
                          <div className="font-medium">Bitcoin</div>
                          <div className="text-xs text-muted-foreground">Flexible Savings</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono">0.025 BTC</div>
                        <div className="text-xs text-green-500">3.5% APY</div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <span className="text-xs font-bold text-blue-500">ETH</span>
                        </div>
                        <div>
                          <div className="font-medium">Ethereum</div>
                          <div className="text-xs text-muted-foreground">Locked · 60 Days</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono">0.5 ETH</div>
                        <div className="text-xs text-green-500">5.2% APY</div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center">
                          <span className="text-xs font-bold text-green-500">USDT</span>
                        </div>
                        <div>
                          <div className="font-medium">Tether</div>
                          <div className="text-xs text-muted-foreground">Locked · 90 Days</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono">1,000 USDT</div>
                        <div className="text-xs text-green-500">12.5% APY</div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="pt-2">
                      <Button variant="outline" className="w-full">
                        <Lock className="mr-2 h-4 w-4" />
                        Manage Positions
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <div className="text-muted-foreground mb-4">Enable demo mode to see your earn assets</div>
                    <Button variant="outline">Get Started</Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Redemption History</CardTitle>
              </CardHeader>
              <CardContent>
                {isDemoMode ? (
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <div>
                        <div className="font-medium">0.2 ETH</div>
                        <div className="text-xs text-muted-foreground">Locked Savings</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs">Matured</div>
                        <div className="text-xs text-muted-foreground">2023-11-04</div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between">
                      <div>
                        <div className="font-medium">500 USDT</div>
                        <div className="text-xs text-muted-foreground">Flexible Savings</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs">Redeemed</div>
                        <div className="text-xs text-muted-foreground">2023-10-28</div>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <Button variant="link" size="sm" className="w-full">
                        View All History
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center text-muted-foreground">
                    No redemption history available
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="mt-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Featured Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="rounded-md border p-3">
                    <div className="flex justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="h-6 w-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                          <span className="text-xs font-bold text-purple-500">DOT</span>
                        </div>
                        <span className="font-medium">Polkadot</span>
                      </div>
                      <Badge className="bg-green-500/20 text-green-500">14.5% APY</Badge>
                    </div>
                    <div className="mt-2 text-xs">90-day lock-up period</div>
                  </div>
                  
                  <div className="rounded-md border p-3">
                    <div className="flex justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <span className="text-xs font-bold text-blue-500">AVAX</span>
                        </div>
                        <span className="font-medium">Avalanche</span>
                      </div>
                      <Badge className="bg-green-500/20 text-green-500">12.8% APY</Badge>
                    </div>
                    <div className="mt-2 text-xs">60-day lock-up period</div>
                  </div>
                  
                  <div className="rounded-md border p-3">
                    <div className="flex justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center">
                          <span className="text-xs font-bold text-green-500">USDC</span>
                        </div>
                        <span className="font-medium">USD Coin</span>
                      </div>
                      <Badge className="bg-green-500/20 text-green-500">9.5% APY</Badge>
                    </div>
                    <div className="mt-2 text-xs">Flexible savings</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SimpleEarnPage;
