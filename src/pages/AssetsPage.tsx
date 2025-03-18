
import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useDashboardContext } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  SearchIcon, PlusCircle, TrendingUp, TrendingDown, 
  ArrowUpRight, ArrowDownRight, Filter, SlidersHorizontal 
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from "recharts";
import TradingViewChart from "@/components/TradingViewChart";

const AssetsPage = () => {
  const { isDemoMode } = useDashboardContext();
  const [selectedAsset, setSelectedAsset] = useState("BTC");
  const [activeTab, setActiveTab] = useState("all-assets");
  
  // Demo assets with predefined values for portfolio
  const demoAssets = [
    { id: 1, name: "Bitcoin", symbol: "BTC", balance: 0.05, value: 3271.61, change: 1.24, color: "#F7931A" },
    { id: 2, name: "Ethereum", symbol: "ETH", balance: 1.5, value: 4868.51, change: 2.38, color: "#627EEA" },
    { id: 3, name: "Solana", symbol: "SOL", balance: 14.8, value: 2255.96, change: 3.42, color: "#00FFA3" },
    { id: 4, name: "Cardano", symbol: "ADA", balance: 450, value: 265.50, change: -0.87, color: "#0033AD" },
    { id: 5, name: "BNB", symbol: "BNB", balance: 2.2, value: 1332.72, change: 0.75, color: "#F3BA2F" },
    { id: 6, name: "Polkadot", symbol: "DOT", balance: 75, value: 975.50, change: -1.25, color: "#E6007A" },
    { id: 7, name: "Avalanche", symbol: "AVAX", balance: 16, value: 512.36, change: 4.12, color: "#E84142" },
    { id: 8, name: "Polygon", symbol: "MATIC", balance: 1200, value: 864.25, change: 0.98, color: "#8247E5" }
  ];
  
  // Demo transactions for asset details
  const demoTransactions = [
    { id: 1, type: "buy", amount: 0.02, price: 65432.10, value: 1308.64, date: "2023-06-15", symbol: "BTC" },
    { id: 2, type: "sell", amount: 0.01, price: 64532.50, value: 645.33, date: "2023-06-29", symbol: "BTC" },
    { id: 3, type: "buy", amount: 0.04, price: 65245.80, value: 2609.83, date: "2023-07-10", symbol: "BTC" },
    { id: 4, type: "buy", amount: 0.5, price: 3240.25, value: 1620.13, date: "2023-06-05", symbol: "ETH" },
    { id: 5, type: "buy", amount: 1.0, price: 3245.60, value: 3245.60, date: "2023-07-12", symbol: "ETH" },
    { id: 6, type: "sell", amount: 5.0, price: 150.45, value: 752.25, date: "2023-07-01", symbol: "SOL" },
    { id: 7, type: "buy", amount: 10.0, price: 152.40, value: 1524.00, date: "2023-07-15", symbol: "SOL" },
    { id: 8, type: "buy", amount: 9.8, price: 152.60, value: 1495.48, date: "2023-07-20", symbol: "SOL" },
  ];
  
  // Calculate total portfolio value
  const totalPortfolioValue = demoAssets.reduce((total, asset) => total + asset.value, 0);
  
  // Filter transactions for selected asset
  const assetTransactions = demoTransactions.filter(tx => tx.symbol === selectedAsset);
  
  // Find the selected asset
  const currentAsset = demoAssets.find(asset => asset.symbol === selectedAsset) || demoAssets[0];
  
  // Show empty state for live mode since there's no real data
  const liveAssets = [];
  
  const assets = isDemoMode ? demoAssets : liveAssets;
  
  // Prepare data for pie chart
  const pieData = assets.map(asset => ({
    name: asset.symbol,
    value: asset.value,
    color: asset.color
  }));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Assets</h1>
          {isDemoMode && <div className="text-sm text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-md">Demo Mode</div>}
        </div>
        
        {assets.length > 0 ? (
          <>
            {/* Portfolio Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white col-span-1">
                <CardHeader>
                  <CardTitle>Portfolio Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-3xl font-bold">${totalPortfolioValue.toLocaleString()}</div>
                    <div className="flex items-center text-green-400">
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                      <span>+2.34% ($235.40)</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <Button className="bg-[#F2FF44] text-black font-medium hover:bg-[#E2EF34]">
                        Deposit
                      </Button>
                      <Button variant="outline">
                        Withdraw
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white col-span-1 lg:col-span-2">
                <CardHeader>
                  <CardTitle>Allocation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          innerRadius={40}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Assets Listing & Details */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white xl:col-span-1">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle>Assets</CardTitle>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <Filter className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <SlidersHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="relative my-2">
                    <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-white/60" />
                    <Input 
                      placeholder="Search assets..." 
                      className="pl-9 bg-white/5 border-white/10" 
                    />
                  </div>
                  <Tabs defaultValue="all-assets" className="w-full" value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="bg-background/40 w-full grid grid-cols-3">
                      <TabsTrigger value="all-assets" className="text-white text-xs">
                        All Assets
                      </TabsTrigger>
                      <TabsTrigger value="gainers" className="text-white text-xs">
                        Gainers
                      </TabsTrigger>
                      <TabsTrigger value="losers" className="text-white text-xs">
                        Losers
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardHeader>
                <CardContent className="px-2 pt-0">
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-1">
                      {assets
                        .filter(asset => {
                          if (activeTab === 'gainers') return asset.change > 0;
                          if (activeTab === 'losers') return asset.change < 0;
                          return true;
                        })
                        .map((asset) => (
                        <div 
                          key={asset.id} 
                          className={`flex items-center justify-between p-3 rounded-lg hover:bg-white/10 transition-colors cursor-pointer ${
                            selectedAsset === asset.symbol ? 'bg-white/15' : ''
                          }`}
                          onClick={() => setSelectedAsset(asset.symbol)}
                        >
                          <div className="flex items-center">
                            <div 
                              className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                              style={{ backgroundColor: `${asset.color}30` }}
                            >
                              <span style={{ color: asset.color }}>{asset.symbol.charAt(0)}</span>
                            </div>
                            <div>
                              <div className="font-medium">{asset.name}</div>
                              <div className="text-sm text-white/60">{asset.balance} {asset.symbol}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">${asset.value.toLocaleString()}</div>
                            <div className={`text-sm flex items-center justify-end ${asset.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {asset.change > 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                              {asset.change > 0 ? '+' : ''}{asset.change}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
              
              <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white xl:col-span-2">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>{currentAsset.name} ({currentAsset.symbol})</CardTitle>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="gap-1">
                        <TrendingDown className="h-4 w-4" />
                        Sell
                      </Button>
                      <Button className="bg-[#F2FF44] text-black font-medium hover:bg-[#E2EF34] gap-1" size="sm">
                        <TrendingUp className="h-4 w-4" />
                        Buy
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="text-sm text-white/60">Holdings</div>
                      <div className="font-bold text-lg">{currentAsset.balance} {currentAsset.symbol}</div>
                      <div className="text-sm">${currentAsset.value.toLocaleString()}</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="text-sm text-white/60">Average Buy Price</div>
                      <div className="font-bold text-lg">${(currentAsset.value / currentAsset.balance).toFixed(2)}</div>
                      <div className="text-sm">Per {currentAsset.symbol}</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="text-sm text-white/60">Profit/Loss</div>
                      <div className={`font-bold text-lg ${currentAsset.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {currentAsset.change > 0 ? '+' : ''}{currentAsset.change}%
                      </div>
                      <div className="text-sm">${(currentAsset.value * currentAsset.change / 100).toFixed(2)}</div>
                    </div>
                  </div>
                  
                  <div className="h-[300px]">
                    <TradingViewChart 
                      symbol={`${currentAsset.symbol}USD`} 
                      height={300} 
                      interval="1D"
                      theme="dark"
                    />
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3">Transaction History</h3>
                    <div className="rounded-lg border border-white/10 overflow-hidden">
                      <div className="grid grid-cols-5 bg-white/5 p-3 text-sm font-medium text-white/80">
                        <div>Type</div>
                        <div>Amount</div>
                        <div>Price</div>
                        <div>Value</div>
                        <div>Date</div>
                      </div>
                      <div className="divide-y divide-white/10">
                        {assetTransactions.length > 0 ? (
                          assetTransactions.map((tx) => (
                            <div key={tx.id} className="grid grid-cols-5 p-3 text-sm">
                              <div className={tx.type === 'buy' ? 'text-green-400' : 'text-red-400'}>
                                {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                              </div>
                              <div>{tx.amount} {tx.symbol}</div>
                              <div>${tx.price.toLocaleString()}</div>
                              <div>${tx.value.toLocaleString()}</div>
                              <div>{tx.date}</div>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-white/60">
                            No transactions found for {selectedAsset}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="h-24 w-24 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <PlusCircle className="h-12 w-12 text-white/60" />
            </div>
            <h2 className="text-xl font-medium text-white mb-2">No Assets Found</h2>
            <p className="text-white/60 mb-6">Start by depositing funds and purchasing assets</p>
            <Button 
  className="bg-[#F2FF44] text-black font-medium hover:bg-[#E2EF34]"
  onClick={() => window.location.href = 'https://121bc70e-c053-463f-b2e4-d866e4703b4b-00-t1pwtshj20ol.riker.replit.dev/'}
>
  Deposit Funds
</Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AssetsPage;
