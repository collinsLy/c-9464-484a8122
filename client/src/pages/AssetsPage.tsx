
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BASE_ASSETS } from "@/lib/constants";

const AssetsPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [assetPrices, setAssetPrices] = useState<Record<string, number>>({
    'BTC': 43250.00,
    'ETH': 2680.50,
    'SOL': 102.75,
    'WLD': 2.85,
    'BNB': 315.20,
    'ADA': 0.52,
    'DOGE': 0.088,
    'XRP': 0.635,
    'DOT': 7.25,
    'LINK': 14.80,
    'MATIC': 0.94,
    'USDT': 1.00,
    'USDC': 1.00
  });
  const [userBalance] = useState(10000);

  // Simulated data matching original design structure
  const portfolioData = {
    totalValue: userBalance,
    change24h: 245.67,
    changePercent: 2.51,
    usdtBalance: 5000,
    otherAssets: 5000
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 px-2 sm:px-4 pb-20">
        {/* Portfolio Analytics Section */}
        <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
          <CardHeader>
            <CardTitle>Portfolio Analytics</CardTitle>
            <div className="flex justify-start">
              <Tabs defaultValue="24h">
                <TabsList className="bg-background/40 border-white/10 text-white">
                  <TabsTrigger value="24h" className="text-white">24h</TabsTrigger>
                  <TabsTrigger value="7d" className="text-white">7d</TabsTrigger>
                  <TabsTrigger value="30d" className="text-white">30d</TabsTrigger>
                  <TabsTrigger value="1y" className="text-white">1y</TabsTrigger>
                  <TabsTrigger value="all" className="text-white">All</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-white/70">Total Portfolio Value</p>
                    <h2 className="text-3xl font-bold">${portfolioData.totalValue.toFixed(2)}</h2>
                    <div className="flex items-center gap-2 text-green-400">
                      <span>+${portfolioData.change24h.toFixed(2)}</span>
                      <span>(+{portfolioData.changePercent.toFixed(2)}%)</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Asset Allocation</h3>
                <div className="space-y-3">
                  {BASE_ASSETS.slice(0, 5).map((asset) => (
                    <div key={asset.symbol} className="flex items-center justify-between h-8">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                        <span>{asset.name} ({asset.symbol})</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-white/70">
                          {asset.symbol === 'USDT' ? '50' : Math.floor(Math.random() * 20)}%
                        </span>
                        <span>${assetPrices[asset.symbol]?.toFixed(2) || '0.00'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-xl sm:text-2xl">Portfolio Overview</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="grid gap-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold">${portfolioData.totalValue.toFixed(2)}</div>
                    <div className="text-sm text-white/60">Total Portfolio Value</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-green-400">
                      +${portfolioData.change24h.toFixed(2)}
                    </div>
                    <div className="text-sm text-white/60">24h Change</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-lg font-semibold">{portfolioData.usdtBalance.toFixed(2)} USDT</div>
                    <div className="text-sm text-white/60">Available Balance</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-lg font-semibold">${portfolioData.otherAssets.toFixed(2)}</div>
                    <div className="text-sm text-white/60">In Other Assets</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-xl sm:text-2xl">Asset Distribution</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="text-center py-8">
                <p className="text-white/60">Chart visualization will be displayed here</p>
                <p className="text-sm text-white/40 mt-2">Real-time data integration in progress</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-2xl">My Assets</CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-2">
            <Tabs defaultValue="coin-view">
              <TabsList className="bg-background/40 w-full mb-2">
                <TabsTrigger value="coin-view" className="flex-1">Coin View</TabsTrigger>
                <TabsTrigger value="account-view" className="flex-1">Account View</TabsTrigger>
              </TabsList>
              <TabsContent value="coin-view" className="pt-2">
                <div className="space-y-2 p-4">
                  {BASE_ASSETS.map((asset) => (
                    <div key={asset.symbol} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-xs font-bold">{asset.symbol.slice(0, 2)}</span>
                        </div>
                        <div>
                          <div className="font-medium">{asset.name}</div>
                          <div className="text-sm text-white/60">{asset.symbol}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          ${assetPrices[asset.symbol]?.toFixed(2) || '0.00'}
                        </div>
                        <div className="text-sm text-white/60">
                          0.00000000 {asset.symbol}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="account-view" className="pt-2">
                <div className="text-center py-6 text-white/60">
                  <p>Account view coming soon</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AssetsPage;
