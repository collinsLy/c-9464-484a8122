
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useDashboardContext } from "@/components/dashboard/DashboardLayout";
import { ArrowRight, Percent, Clock, Calendar, TrendingUp, BarChart3, RefreshCw, Wallet, ExternalLink } from "lucide-react";
import { toast } from "sonner";

// Define the crypto pair type
interface CryptoPair {
  id: string;
  name1: string;
  name2: string;
  symbol1: string;
  symbol2: string;
  tvl: string;
  farmApr: string;
  totalApr: string;
  logo1: string;
  logo2: string;
  badges?: string[];
}

const LiquidityFarmingPage = () => {
  const { isDemoMode } = useDashboardContext();
  const [selectedPair, setSelectedPair] = useState("BTC-USDT");
  const [amount, setAmount] = useState("");
  const [duration, setDuration] = useState(30);
  const [farmTab, setFarmTab] = useState("active");
  const [autoCompound, setAutoCompound] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Define available pool pairs with their details
  const poolPairs: CryptoPair[] = [
    { 
      id: "BTC-USDT", 
      name1: "Bitcoin", 
      name2: "Tether", 
      symbol1: "BTC", 
      symbol2: "USDT", 
      tvl: "$428.2M", 
      farmApr: "24.6%", 
      totalApr: "27.8%", 
      logo1: "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/btc.svg",
      logo2: "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/usdt.svg",
      badges: ["Hot"]
    },
    { 
      id: "ETH-USDT", 
      name1: "Ethereum", 
      name2: "Tether", 
      symbol1: "ETH", 
      symbol2: "USDT", 
      tvl: "$312.5M", 
      farmApr: "18.9%", 
      totalApr: "21.2%", 
      logo1: "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/eth.svg",
      logo2: "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/usdt.svg"
    },
    { 
      id: "BTC-ETH", 
      name1: "Bitcoin", 
      name2: "Ethereum", 
      symbol1: "BTC", 
      symbol2: "ETH", 
      tvl: "$98.7M", 
      farmApr: "32.4%", 
      totalApr: "35.1%", 
      logo1: "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/btc.svg",
      logo2: "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/eth.svg",
      badges: ["New"]
    },
    { 
      id: "SOL-USDT", 
      name1: "Solana", 
      name2: "Tether", 
      symbol1: "SOL", 
      symbol2: "USDT", 
      tvl: "$76.3M", 
      farmApr: "28.7%", 
      totalApr: "30.9%", 
      logo1: "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/sol.svg",
      logo2: "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/usdt.svg"
    },
    { 
      id: "MATIC-USDT", 
      name1: "Polygon", 
      name2: "Tether", 
      symbol1: "MATIC", 
      symbol2: "USDT", 
      tvl: "$54.8M", 
      farmApr: "26.5%", 
      totalApr: "29.2%", 
      logo1: "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/matic.svg",
      logo2: "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/usdt.svg"
    }
  ];

  // Get the current selected pair details
  const currentPair = poolPairs.find(pair => pair.id === selectedPair) || poolPairs[0];

  // Demo active positions
  const activePositions = [
    {
      id: "position-1",
      pair: "BTC-USDT",
      status: "Active",
      assets: {
        amount1: "0.0125",
        amount2: "628.42",
        symbol1: "BTC",
        symbol2: "USDT",
        logo1: "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/btc.svg",
        logo2: "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/usdt.svg",
      },
      value: "$1,256.84",
      rewards: "2.34 VTEX",
      progress: 68
    },
    {
      id: "position-2",
      pair: "ETH-USDT",
      status: "Active",
      assets: {
        amount1: "0.234",
        amount2: "512.38",
        symbol1: "ETH",
        symbol2: "USDT",
        logo1: "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/eth.svg",
        logo2: "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/usdt.svg",
      },
      value: "$1,024.76",
      rewards: "1.87 VTEX",
      progress: 42
    }
  ];

  // Demo ended positions
  const endedPositions = [
    {
      id: "position-3",
      pair: "SOL-USDT",
      status: "Ended",
      assets: {
        amount1: "4.21",
        amount2: "342.62",
        symbol1: "SOL",
        symbol2: "USDT",
        logo1: "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/sol.svg",
        logo2: "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/usdt.svg",
      },
      value: "$685.24",
      rewards: "3.42 VTEX",
      progress: 100
    }
  ];

  // Simulate price calculation based on amount
  const calculateEquivalentAmount = (amount: string) => {
    if (!amount || isNaN(parseFloat(amount))) return "";
    
    // Get the exchange rate based on the selected pair
    let rate = 50234.25; // Default BTC-USDT rate
    if (selectedPair === "ETH-USDT") rate = 2876.49;
    if (selectedPair === "SOL-USDT") rate = 132.65;
    if (selectedPair === "MATIC-USDT") rate = 1.24;
    if (selectedPair === "BTC-ETH") rate = 17.5;
    
    return (parseFloat(amount) * rate).toFixed(2);
  };

  const handleAddLiquidity = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsLoading(true);
    
    // Simulate network delay
    setTimeout(() => {
      if (isDemoMode) {
        toast.success("Successfully added liquidity", {
          description: `Added ${amount} ${currentPair.symbol1} and ${calculateEquivalentAmount(amount)} ${currentPair.symbol2} to ${selectedPair} pool`,
        });
      } else {
        toast.error("Please enable demo mode to test this feature");
      }
      setIsLoading(false);
    }, 1500);
  };

  const handleHarvest = (positionId: string) => {
    setIsLoading(true);
    setTimeout(() => {
      toast.success("Rewards harvested successfully", {
        description: "Your VTEX tokens have been added to your wallet"
      });
      setIsLoading(false);
    }, 1200);
  };

  const handleWithdraw = (positionId: string) => {
    setIsLoading(true);
    setTimeout(() => {
      toast.success("Liquidity withdrawn successfully", {
        description: "Your assets have been returned to your wallet"
      });
      setIsLoading(false);
    }, 1500);
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 w-full max-w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white break-words">Liquidity Farming</h1>
            <p className="text-sm text-white/70 mt-1">Provide liquidity and earn rewards</p>
          </div>
          {isDemoMode && <div className="text-sm text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-md">Demo Mode</div>}
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          <div className="w-full lg:w-2/3 space-y-4">
            <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white w-full overflow-hidden">
              <CardHeader>
                <CardTitle>Add Liquidity</CardTitle>
                <CardDescription className="text-white/70">Provide liquidity to earn trading fees and farming rewards</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-white/70">Select Pool</Label>
                  <Select value={selectedPair} onValueChange={setSelectedPair}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Select pool" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10 text-white">
                      {poolPairs.map((pair) => (
                        <SelectItem key={pair.id} value={pair.id}>
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-1">
                              <img 
                                src={pair.logo1} 
                                alt={pair.symbol1} 
                                className="w-5 h-5 rounded-full ring-2 ring-black z-10"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/generic.svg";
                                }}
                              />
                              <img 
                                src={pair.logo2} 
                                alt={pair.symbol2} 
                                className="w-5 h-5 rounded-full ring-2 ring-black"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/generic.svg";
                                }}
                              />
                            </div>
                            {pair.id}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-lg bg-white/5 p-4 border border-white/10">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
                          <img 
                            src={currentPair.logo1}
                            alt={currentPair.symbol1} 
                            className="w-6 h-6"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/generic.svg";
                            }}
                          />
                        </div>
                        <span>{currentPair.name1}</span>
                      </div>
                      <Badge variant="outline" className="text-white/70 border-white/10">Balance: {isDemoMode ? (currentPair.symbol1 === "BTC" ? "0.1482" : currentPair.symbol1 === "ETH" ? "2.35" : "45.78") : "0.00"}</Badge>
                    </div>
                    <Input
                      type="text"
                      placeholder="0.00"
                      className="bg-transparent border-white/10 text-white mt-2"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                    <div className="flex justify-end mt-1">
                      <Button variant="ghost" size="sm" className="text-xs text-white/70 hover:text-white hover:bg-white/10">MAX</Button>
                    </div>
                  </div>

                  <div className="rounded-lg bg-white/5 p-4 border border-white/10">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
                          <img 
                            src={currentPair.logo2}
                            alt={currentPair.symbol2} 
                            className="w-6 h-6"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/generic.svg";
                            }}
                          />
                        </div>
                        <span>{currentPair.name2}</span>
                      </div>
                      <Badge variant="outline" className="text-white/70 border-white/10">Balance: {isDemoMode ? (currentPair.symbol2 === "USDT" ? "3,421.55" : currentPair.symbol2 === "ETH" ? "2.35" : "0.00") : "0.00"}</Badge>
                    </div>
                    <Input
                      type="text"
                      placeholder="0.00"
                      className="bg-transparent border-white/10 text-white mt-2"
                      value={calculateEquivalentAmount(amount)}
                      readOnly
                    />
                    <div className="flex justify-end mt-1">
                      <Button variant="ghost" size="sm" className="text-xs text-white/70 hover:text-white hover:bg-white/10">MAX</Button>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-white/5 p-4 border border-white/10">
                  <h3 className="font-medium mb-3">Pool Information</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-white/70">Pool Rate</p>
                      <p className="font-mono">1 {currentPair.symbol1} = {selectedPair === "BTC-USDT" ? "50,234.25" : selectedPair === "ETH-USDT" ? "2,876.49" : selectedPair === "SOL-USDT" ? "132.65" : selectedPair === "MATIC-USDT" ? "1.24" : "17.5"} {currentPair.symbol2}</p>
                    </div>
                    <div>
                      <p className="text-white/70">Total Liquidity</p>
                      <p className="font-mono">{currentPair.tvl}</p>
                    </div>
                    <div>
                      <p className="text-white/70">Your Share</p>
                      <p className="font-mono">{amount && parseFloat(amount) > 0 ? "0.01%" : "0.00%"}</p>
                    </div>
                    <div>
                      <p className="text-white/70">Trading Fee</p>
                      <p className="font-mono">0.3%</p>
                    </div>
                    <div>
                      <p className="text-white/70">Farm APR</p>
                      <p className="font-mono text-green-400">{currentPair.farmApr}</p>
                    </div>
                    <div>
                      <p className="text-white/70">Total APR</p>
                      <p className="font-mono text-green-400">{currentPair.totalApr}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-white/5 p-4 border border-white/10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-medium mb-2">Lock Duration</h3>
                      <div className="flex flex-col gap-6">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-white/70">Duration (days)</span>
                            <span className="font-mono">{duration} days</span>
                          </div>
                          <Slider 
                            value={[duration]} 
                            min={7} 
                            max={365} 
                            step={1} 
                            onValueChange={(value) => setDuration(value[0])}
                            className="w-full" 
                          />
                          <div className="flex justify-between text-xs text-white/50 mt-1">
                            <span>7 days</span>
                            <span>1 year</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="md:w-1/3">
                      <h3 className="font-medium mb-2">Options</h3>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="auto-compound" className="cursor-pointer">Auto-compound rewards</Label>
                        <Switch 
                          id="auto-compound" 
                          checked={autoCompound} 
                          onCheckedChange={setAutoCompound}
                        />
                      </div>
                      <p className="text-xs text-white/50 mt-1">
                        {autoCompound ? "Rewards will be automatically reinvested" : "Rewards will need to be manually collected"}
                      </p>
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full bg-[#F2FF44] text-black hover:bg-[#E1EE33]" 
                  onClick={handleAddLiquidity}
                  disabled={isLoading || !amount || parseFloat(amount) <= 0}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : "Add Liquidity"}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white overflow-x-auto">
              <CardHeader>
                <CardTitle>Available Farming Pools</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10 hover:bg-transparent">
                        <TableHead className="text-white/70 px-4">Pool</TableHead>
                        <TableHead className="text-white/70">TVL</TableHead>
                        <TableHead className="text-white/70">Farm APR</TableHead>
                        <TableHead className="text-white/70">Total APR</TableHead>
                        <TableHead className="text-white/70 text-right pr-4"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {poolPairs.map((pair) => (
                        <TableRow key={pair.id} className="border-white/10 hover:bg-white/5">
                          <TableCell className="px-4">
                            <div className="flex items-center space-x-2">
                              <div className="flex -space-x-2">
                                <img 
                                  src={pair.logo1} 
                                  alt={pair.symbol1} 
                                  className="w-6 h-6 rounded-full ring-2 ring-black z-10"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/generic.svg";
                                  }}
                                />
                                <img 
                                  src={pair.logo2} 
                                  alt={pair.symbol2} 
                                  className="w-6 h-6 rounded-full ring-2 ring-black"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/generic.svg";
                                  }}
                                />
                              </div>
                              <span>{pair.id}</span>
                              {pair.badges?.includes("Hot") && (
                                <Badge variant="outline" className="text-yellow-400 border-yellow-400/20 bg-yellow-400/5 ml-1">Hot</Badge>
                              )}
                              {pair.badges?.includes("New") && (
                                <Badge variant="outline" className="text-purple-400 border-purple-400/20 bg-purple-400/5 ml-1">New</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{pair.tvl}</TableCell>
                          <TableCell className="text-green-400">{pair.farmApr}</TableCell>
                          <TableCell className="text-green-400">{pair.totalApr}</TableCell>
                          <TableCell className="text-right pr-4">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="border-white/10 hover:bg-white/10 hover:text-white"
                              onClick={() => setSelectedPair(pair.id)}
                            >
                              Select
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="w-full lg:w-1/3 space-y-4">
            <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
              <CardHeader>
                <CardTitle>Your Farming</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue={farmTab} onValueChange={setFarmTab}>
                  <TabsList className="w-full bg-white/5 text-white mb-4">
                    <TabsTrigger value="active" className="data-[state=active]:bg-white/10">Active</TabsTrigger>
                    <TabsTrigger value="ended" className="data-[state=active]:bg-white/10">Ended</TabsTrigger>
                  </TabsList>
                  <TabsContent value="active" className="mt-0">
                    {isDemoMode ? (
                      <div className="space-y-4">
                        {activePositions.map((position) => (
                          <div key={position.id} className="rounded-lg bg-white/5 p-4 border border-white/10">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className="flex -space-x-2">
                                  <img 
                                    src={position.assets.logo1} 
                                    alt={position.assets.symbol1} 
                                    className="w-6 h-6 rounded-full ring-2 ring-black z-10"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/generic.svg";
                                    }}
                                  />
                                  <img 
                                    src={position.assets.logo2} 
                                    alt={position.assets.symbol2} 
                                    className="w-6 h-6 rounded-full ring-2 ring-black"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/generic.svg";
                                    }}
                                  />
                                </div>
                                <span className="font-medium">{position.pair}</span>
                              </div>
                              <Badge className="bg-green-500/20 text-green-500">{position.status}</Badge>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <p className="text-white/70">Your Liquidity</p>
                                <p className="font-mono">{position.assets.amount1} {position.assets.symbol1}</p>
                                <p className="font-mono">{position.assets.amount2} {position.assets.symbol2}</p>
                              </div>
                              <div>
                                <p className="text-white/70">Value</p>
                                <p className="font-mono">{position.value}</p>
                              </div>
                            </div>

                            <div className="mt-4">
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-white/70">Earned Rewards</span>
                                <span className="text-green-400">+{position.rewards}</span>
                              </div>
                              <Progress value={position.progress} className="h-2 bg-white/10" indicatorClassName="bg-[#F2FF44]" />
                            </div>

                            <div className="flex justify-between items-center mt-4">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="border-white/10 hover:bg-white/10 hover:text-white"
                                onClick={() => handleHarvest(position.id)}
                                disabled={isLoading}
                              >
                                {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Harvest"}
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="border-white/10 hover:bg-white/10 hover:text-white"
                                onClick={() => handleWithdraw(position.id)}
                                disabled={isLoading}
                              >
                                {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Withdraw"}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Wallet className="h-12 w-12 text-white/30 mb-3" />
                        <p className="text-white/70 mb-3">You don't have any active farming positions</p>
                        <Button 
                          className="bg-[#F2FF44] text-black hover:bg-[#E1EE33]"
                          onClick={() => document.getElementById("liquidity-section")?.scrollIntoView({ behavior: "smooth" })}
                        >
                          Add Liquidity
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="ended" className="mt-0">
                    {isDemoMode ? (
                      <div className="space-y-4">
                        {endedPositions.map((position) => (
                          <div key={position.id} className="rounded-lg bg-white/5 p-4 border border-white/10">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className="flex -space-x-2">
                                  <img 
                                    src={position.assets.logo1} 
                                    alt={position.assets.symbol1} 
                                    className="w-6 h-6 rounded-full ring-2 ring-black z-10"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/generic.svg";
                                    }}
                                  />
                                  <img 
                                    src={position.assets.logo2} 
                                    alt={position.assets.symbol2} 
                                    className="w-6 h-6 rounded-full ring-2 ring-black"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/generic.svg";
                                    }}
                                  />
                                </div>
                                <span className="font-medium">{position.pair}</span>
                              </div>
                              <Badge className="bg-gray-500/20 text-gray-400">{position.status}</Badge>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <p className="text-white/70">Your Liquidity</p>
                                <p className="font-mono">{position.assets.amount1} {position.assets.symbol1}</p>
                                <p className="font-mono">{position.assets.amount2} {position.assets.symbol2}</p>
                              </div>
                              <div>
                                <p className="text-white/70">Value</p>
                                <p className="font-mono">{position.value}</p>
                              </div>
                            </div>

                            <div className="mt-4">
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-white/70">Earned Rewards</span>
                                <span className="text-green-400">+{position.rewards}</span>
                              </div>
                              <Progress value={position.progress} className="h-2 bg-white/10" indicatorClassName="bg-[#F2FF44]" />
                            </div>

                            <div className="flex justify-between items-center mt-4">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="border-white/10 hover:bg-white/10 hover:text-white"
                                onClick={() => handleHarvest(position.id)}
                                disabled={isLoading}
                              >
                                {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Claim All"}
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="border-white/10 hover:bg-white/10 hover:text-white"
                                onClick={() => handleWithdraw(position.id)}
                                disabled={isLoading}
                              >
                                {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Withdraw"}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-4 text-center text-white/70">
                        No ended farming positions
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
              <CardHeader>
                <CardTitle>Rewards</CardTitle>
              </CardHeader>
              <CardContent>
                {isDemoMode ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center">
                          <span className="text-xs font-bold">VTEX</span>
                        </div>
                        <div>
                          <div className="font-medium">Vertex Token</div>
                          <div className="text-xs text-white/70">Platform token</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono">7.63 VTEX</div>
                        <div className="text-xs text-white/70">≈ $38.15</div>
                      </div>
                    </div>

                    <Separator className="bg-white/10" />

                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
                          <img 
                            src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/usdt.svg" 
                            alt="USDT" 
                            className="w-6 h-6"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/generic.svg";
                            }}
                          />
                        </div>
                        <div>
                          <div className="font-medium">Trading Fees</div>
                          <div className="text-xs text-white/70">Collected fees</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono">12.84 USDT</div>
                        <div className="text-xs text-white/70">≈ $12.84</div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button 
                        variant="outline" 
                        className="w-full border-white/10 hover:bg-white/10 hover:text-white"
                        onClick={() => {
                          setIsLoading(true);
                          setTimeout(() => {
                            toast.success("All rewards claimed successfully", {
                              description: "Rewards have been added to your wallet"
                            });
                            setIsLoading(false);
                          }, 1500);
                        }}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : "Claim All Rewards"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center text-white/70">
                    No rewards available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Why Provide Liquidity?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-[#F2FF44]/20 flex items-center justify-center">
                        <Percent className="h-4 w-4 text-[#F2FF44]" />
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Earn Trading Fees</div>
                      <div className="text-white/70">0.3% of all trades goes to liquidity providers</div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-[#F2FF44]/20 flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 text-[#F2FF44]" />
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Farm Rewards</div>
                      <div className="text-white/70">Earn VTEX tokens for providing liquidity</div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-[#F2FF44]/20 flex items-center justify-center">
                        <BarChart3 className="h-4 w-4 text-[#F2FF44]" />
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">High APR</div>
                      <div className="text-white/70">Up to 35% APR on selected pools</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-xs text-white/50">
                  Note: Providing liquidity comes with risks including impermanent loss. Learn more about <a href="#" className="text-[#F2FF44] hover:underline inline-flex items-center">impermanent loss <ExternalLink className="h-3 w-3 ml-1" /></a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LiquidityFarmingPage;
