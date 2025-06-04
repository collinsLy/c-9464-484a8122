
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserService } from "@/lib/firebase-service";
import { BASE_ASSETS } from "@/lib/constants";

interface AssetPrice {
  symbol: string;
  price: number;
  change24h: number;
  changePercent24h: number;
}

interface UserAsset {
  symbol: string;
  amount: number;
  value: number;
}

const AssetsPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [assetPrices, setAssetPrices] = useState<Record<string, AssetPrice>>({});
  const [userBalance, setUserBalance] = useState(0);
  const [userAssets, setUserAssets] = useState<UserAsset[]>([]);
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [portfolio24hChange, setPortfolio24hChange] = useState(0);

  // Fetch real-time prices from Binance API
  const fetchRealTimePrices = async () => {
    try {
      const symbols = BASE_ASSETS.map(asset => `${asset.symbol}USDT`).filter(s => s !== 'USDTUSDT');
      const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr`);
      const data = await response.json();
      
      const priceMap: Record<string, AssetPrice> = {};
      
      // Add USDT as base
      priceMap['USDT'] = {
        symbol: 'USDT',
        price: 1.00,
        change24h: 0,
        changePercent24h: 0
      };

      data.forEach((ticker: any) => {
        const symbol = ticker.symbol.replace('USDT', '');
        if (BASE_ASSETS.some(asset => asset.symbol === symbol)) {
          priceMap[symbol] = {
            symbol: symbol,
            price: parseFloat(ticker.lastPrice),
            change24h: parseFloat(ticker.priceChange),
            changePercent24h: parseFloat(ticker.priceChangePercent)
          };
        }
      });

      setAssetPrices(priceMap);
    } catch (error) {
      console.error('Error fetching prices:', error);
    }
  };

  // Get user data and assets
  useEffect(() => {
    const uid = localStorage.getItem('userId');
    if (!uid) {
      console.log('No user ID found, setting default state');
      return;
    }

    const unsubscribe = UserService.subscribeToUserData(uid, (userData) => {
      if (userData) {
        const balance = typeof userData.balance === 'number' ? userData.balance : parseFloat(userData.balance) || 0;
        setUserBalance(balance);

        // Process user assets
        const assets: UserAsset[] = [];
        
        // Add USDT balance
        if (balance > 0) {
          assets.push({
            symbol: 'USDT',
            amount: balance,
            value: balance
          });
        }

        // Add other crypto assets
        if (userData.assets) {
          Object.entries(userData.assets).forEach(([symbol, data]: [string, any]) => {
            const amount = data.amount || 0;
            if (amount > 0) {
              const price = assetPrices[symbol]?.price || 0;
              assets.push({
                symbol: symbol,
                amount: amount,
                value: amount * price
              });
            }
          });
        }

        setUserAssets(assets);
      }
    });

    return () => unsubscribe();
  }, [assetPrices]);

  // Calculate portfolio totals
  useEffect(() => {
    const totalValue = userAssets.reduce((sum, asset) => sum + asset.value, 0);
    setPortfolioValue(totalValue);

    // Calculate 24h change (simplified calculation)
    const change24h = userAssets.reduce((sum, asset) => {
      const assetPrice = assetPrices[asset.symbol];
      if (assetPrice && assetPrice.changePercent24h !== 0) {
        const previousValue = asset.value / (1 + assetPrice.changePercent24h / 100);
        return sum + (asset.value - previousValue);
      }
      return sum;
    }, 0);
    setPortfolio24hChange(change24h);
  }, [userAssets, assetPrices]);

  // Fetch prices on component mount and set up interval
  useEffect(() => {
    fetchRealTimePrices();
    const interval = setInterval(fetchRealTimePrices, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Get official crypto logo URL
  const getCryptoLogoUrl = (symbol: string): string => {
    const symbolLower = symbol.toLowerCase();
    return `https://cryptologos.cc/logos/${symbolLower}-${symbolLower}-logo.png`;
  };

  // Fallback logo if main logo fails
  const getFallbackLogoUrl = (symbol: string): string => {
    return `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/${symbol.toLowerCase()}.svg`;
  };

  const portfolioData = {
    totalValue: portfolioValue,
    change24h: portfolio24hChange,
    changePercent: portfolioValue > 0 ? (portfolio24hChange / portfolioValue) * 100 : 0,
    usdtBalance: userBalance,
    otherAssets: portfolioValue - userBalance
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
                    <div className={`flex items-center gap-2 ${portfolioData.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      <span>{portfolioData.change24h >= 0 ? '+' : ''}${portfolioData.change24h.toFixed(2)}</span>
                      <span>({portfolioData.change24h >= 0 ? '+' : ''}{portfolioData.changePercent.toFixed(2)}%)</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Asset Allocation</h3>
                <div className="space-y-3">
                  {userAssets.slice(0, 5).map((asset) => {
                    const percentage = portfolioValue > 0 ? (asset.value / portfolioValue) * 100 : 0;
                    return (
                      <div key={asset.symbol} className="flex items-center justify-between h-8">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-primary"></div>
                          <span>{BASE_ASSETS.find(a => a.symbol === asset.symbol)?.name || asset.symbol} ({asset.symbol})</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-white/70">{percentage.toFixed(1)}%</span>
                          <span>${assetPrices[asset.symbol]?.price?.toFixed(2) || '0.00'}</span>
                        </div>
                      </div>
                    );
                  })}
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
                    <div className={`text-lg font-semibold ${portfolioData.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {portfolioData.change24h >= 0 ? '+' : ''}${portfolioData.change24h.toFixed(2)}
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
              <CardTitle className="text-xl sm:text-2xl">Live Market Prices</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-2">
                {Object.values(assetPrices).slice(0, 5).map((asset) => (
                  <div key={asset.symbol} className="flex justify-between items-center">
                    <span className="font-medium">{asset.symbol}</span>
                    <div className="text-right">
                      <div className="text-sm">${asset.price.toFixed(2)}</div>
                      <div className={`text-xs ${asset.changePercent24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {asset.changePercent24h >= 0 ? '+' : ''}{asset.changePercent24h.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                ))}
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
                <TabsTrigger value="market-view" className="flex-1">Market View</TabsTrigger>
              </TabsList>
              <TabsContent value="coin-view" className="pt-2">
                <div className="space-y-2 p-4">
                  {userAssets.length > 0 ? (
                    userAssets.map((asset) => {
                      const priceData = assetPrices[asset.symbol];
                      return (
                        <div key={asset.symbol} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                          <div className="flex items-center gap-3">
                            <img 
                              src={getCryptoLogoUrl(asset.symbol)}
                              alt={asset.symbol}
                              className="w-8 h-8 rounded-full"
                              onError={(e) => {
                                e.currentTarget.src = getFallbackLogoUrl(asset.symbol);
                              }}
                            />
                            <div>
                              <div className="font-medium">{BASE_ASSETS.find(a => a.symbol === asset.symbol)?.name || asset.symbol}</div>
                              <div className="text-sm text-white/60">{asset.symbol}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">${asset.value.toFixed(2)}</div>
                            <div className="text-sm text-white/60">
                              {asset.amount.toFixed(8)} {asset.symbol}
                            </div>
                            {priceData && (
                              <div className={`text-xs ${priceData.changePercent24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {priceData.changePercent24h >= 0 ? '+' : ''}{priceData.changePercent24h.toFixed(2)}%
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-white/60">
                      <p>No assets found</p>
                      <p className="text-sm mt-2">Deposit funds to start trading</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="market-view" className="pt-2">
                <div className="space-y-2 p-4">
                  {Object.values(assetPrices).map((asset) => (
                    <div key={asset.symbol} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                      <div className="flex items-center gap-3">
                        <img 
                          src={getCryptoLogoUrl(asset.symbol)}
                          alt={asset.symbol}
                          className="w-8 h-8 rounded-full"
                          onError={(e) => {
                            e.currentTarget.src = getFallbackLogoUrl(asset.symbol);
                          }}
                        />
                        <div>
                          <div className="font-medium">{BASE_ASSETS.find(a => a.symbol === asset.symbol)?.name || asset.symbol}</div>
                          <div className="text-sm text-white/60">{asset.symbol}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${asset.price.toFixed(2)}</div>
                        <div className={`text-sm ${asset.changePercent24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {asset.changePercent24h >= 0 ? '+' : ''}{asset.changePercent24h.toFixed(2)}%
                        </div>
                        <div className="text-xs text-white/60">
                          {asset.changePercent24h >= 0 ? '+' : ''}${asset.change24h.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
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
