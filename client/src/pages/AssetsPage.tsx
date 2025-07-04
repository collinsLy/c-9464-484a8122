import { useState, useEffect } from "react";
import { UserService } from "@/lib/firebase-service";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PortfolioAnalytics } from "@/components/dashboard/PortfolioAnalytics";

// Centralized function to fetch prices using the proxy endpoint
const fetchPricesFromProxy = async (symbols: string[]) => {
  const symbolsQuery = symbols.map(s => `${s}USDT`);
  const response = await fetch(`/api/v3/ticker/price?symbols=${JSON.stringify(symbolsQuery)}`);
  const data = await response.json();

  const prices: Record<string, number> = { USDT: 1 };
  data.forEach((item: { symbol: string; price: string }) => {
    const symbol = item.symbol.replace('USDT', '');
    prices[symbol] = parseFloat(item.price);
  });

  return prices;
};

const AssetsPage = () => {
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [previousDayBalance, setPreviousDayBalance] = useState(0);
  const [selectedCrypto, setSelectedCrypto] = useState("BTC");

  const [totalPortfolioValue, setTotalPortfolioValue] = useState(0);
  const [assetPrices, setAssetPrices] = useState<Record<string, number>>({});
  const [userAssets, setUserAssets] = useState<Record<string, any>>({});
  const [pricesLoaded, setPricesLoaded] = useState(false);
  const [dataReady, setDataReady] = useState(false);

  // Fetch initial prices when component mounts
  useEffect(() => {
    let isMounted = true;

    const fetchInitialPrices = async () => {
      try {
        const symbols = baseAssets
          .map(asset => asset.symbol)
          .filter(symbol => symbol !== 'USDT');

        const symbolsQuery = symbols.map(s => `${s}USDT`);
        const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbols=${JSON.stringify(symbolsQuery)}`);
        const data = await response.json();

        const prices: Record<string, number> = { USDT: 1 };
        data.forEach((item: any) => {
          const symbol = item.symbol.replace('USDT', '');
          prices[symbol] = parseFloat(item.price);
        });

        if (isMounted) {
          setAssetPrices(prices);
          setPricesLoaded(true);

          // Calculate portfolio value if we have user assets
          if (Object.keys(userAssets).length > 0) {
            calculatePortfolioValue(userAssets, prices, balance);
            setDataReady(true);
          }
        }
      } catch (error) {
        console.error('Error fetching initial prices:', error);
        if (isMounted) {
          setPricesLoaded(true);
          setDataReady(true);
        }
      }
    };

    fetchInitialPrices();

    return () => {
      isMounted = false;
    };
  }, []);

  // Periodic price updates
  useEffect(() => {
    if (!pricesLoaded) return;

    const interval = setInterval(async () => {
      try {
        const symbols = baseAssets
          .map(asset => asset.symbol)
          .filter(symbol => symbol !== 'USDT');

        const symbolsQuery = symbols.map(s => `${s}USDT`);
        const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbols=${JSON.stringify(symbolsQuery)}`);
        const data = await response.json();

        const prices: Record<string, number> = { USDT: 1 };
        data.forEach((item: any) => {
          const symbol = item.symbol.replace('USDT', '');
          prices[symbol] = parseFloat(item.price);
        });

        setAssetPrices(prices);
        calculatePortfolioValue(userAssets, prices, balance);
      } catch (error) {
        console.error('Error updating prices:', error);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [pricesLoaded, userAssets, balance]);

  // Calculate total portfolio value with current prices
  const calculatePortfolioValue = (assets: Record<string, any>, prices: Record<string, number>, usdtBalance: number) => {
    let total = 0;

    // Get total USDT amount from both sources
    let totalUsdtAmount = usdtBalance; // Main balance field

    // Add USDT from assets if it exists (this is the new location)
    if (assets && assets.USDT && assets.USDT.amount !== undefined) {
      totalUsdtAmount += Number(assets.USDT.amount);
    }

    // Add USDT value to total
    total += totalUsdtAmount;

    // Add value of all other assets
    if (assets) {
      Object.entries(assets).forEach(([symbol, data]) => {
        if (symbol === 'USDT') return; // Skip USDT as it's already included above
        const amount = data.amount || 0;
        const price = prices[symbol] || 0;
        const valueInUsdt = amount * price;
        total += valueInUsdt;
      });
    }

    setTotalPortfolioValue(total);
  };

  useEffect(() => {
    const uid = localStorage.getItem('userId');
    if (!uid) {
      setIsLoading(false);
      return;
    }

    // Get yesterday's date at midnight
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const unsubscribe = UserService.subscribeToUserData(uid, (userData) => {
      // Set previous day balance from userData
      if (userData?.previousDayBalance) {
        setPreviousDayBalance(userData.previousDayBalance);
      }
      if (userData) {
        const parsedBalance = typeof userData.balance === 'string' ? parseFloat(userData.balance) : userData.balance;
        setBalance(parsedBalance || 0);
        setUserAssets(userData.assets || {});

        // Calculate portfolio value only if prices are loaded
        if (pricesLoaded && Object.keys(assetPrices).length > 0) {
          calculatePortfolioValue(userData.assets || {}, assetPrices, parsedBalance || 0);
          setDataReady(true);
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [assetPrices]);

  const [prices, setPrices] = useState<Record<string, number>>({});

  // Base assets list that will be shown to all users
  const baseAssets = [
    {
      name: "BTC",
      symbol: "BTC",
      fullName: "Bitcoin",
      balance: 0,
      amount: "0.00000000"
    },
    {
      name: "ETH",
      symbol: "ETH",
      fullName: "Ethereum",
      balance: 0,
      amount: "0.00000000"
    },
    {
      name: "USDT",
      symbol: "USDT",
      fullName: "TetherUS",
      balance: balance + (userAssets.USDT?.amount || 0),
      amount: (balance + (userAssets.USDT?.amount || 0)).toFixed(8)
    },
    {
      name: "USDC",
      symbol: "USDC",
      fullName: "USD Coin",
      balance: 0,
      amount: "0.00000000"
    },
    {
      name: "BNB",
      symbol: "BNB",
      fullName: "Binance Coin",
      balance: 0,
      amount: "0.00000000"
    },
    {
      name: "DOGE",
      symbol: "DOGE",
      fullName: "Dogecoin",
      balance: 0,
      amount: "0.00000000"
    },
    {
      name: "SOL",
      symbol: "SOL",
      fullName: "Solana",
      balance: 0,
      amount: "0.00000000"
    },
    {
      name: "XRP",
      symbol: "XRP",
      fullName: "Ripple",
      balance: 0,
      amount: "0.00000000"
    },
    {
      name: "WLD",
      symbol: "WLD",
      fullName: "Worldcoin",
      balance: 0,
      amount: "0.00000000"
    },
    {
      name: "ADA",
      symbol: "ADA",
      fullName: "Cardano",
      balance: 0,
      amount: "0.00000000"
    },
    {
      name: "DOT",
      symbol: "DOT",
      fullName: "Polkadot",
      balance: 0,
      amount: "0.00000000"
    },
    {
      name: "LINK",
      symbol: "LINK",
      fullName: "Chainlink",
      balance: 0,
      amount: "0.00000000"
    },
    {
      name: "MATIC",
      symbol: "MATIC",
      fullName: "Polygon",
      balance: 0,
      amount: "0.00000000"
    }
  ];

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const symbols = baseAssets.map(asset => `${asset.symbol}USDT`);
        const symbolsParam = encodeURIComponent(JSON.stringify(symbols));
        const response = await fetch(`/api/v3/ticker/price?symbols=${symbolsParam}`, {
          headers: { 
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });

        if (!response.ok) {
          console.error('Price fetch failed:', response.status, response.statusText);
          return;
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Invalid response type:', contentType);
          return;
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          const newPrices: Record<string, number> = {};
          data.forEach((item: { symbol: string; price: string }) => {
            const symbol = item.symbol.replace('USDT', '');
            newPrices[symbol] = parseFloat(item.price);
          });
          setPrices(newPrices);
        }
      } catch (error) {
        console.error('Error fetching prices:', error);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  // Merge base assets with user's actual assets data
  const assets = baseAssets.map(asset => {
    // Check if user has this asset
    const userAsset = userAssets[asset.symbol];

    // Special handling for USDT - combine both balance sources
    if (asset.symbol === 'USDT') {
      const totalUsdtAmount = balance + (userAsset?.amount || 0);
      return {
        ...asset,
        amount: totalUsdtAmount.toFixed(8),
        balance: totalUsdtAmount, // USDT price is always 1
        price: 1
      };
    }

    return {
      ...asset,
      // Override amount and balance if user has this asset
      amount: userAsset ? userAsset.amount.toFixed(8) : asset.amount,
      balance: userAsset ? userAsset.amount * (assetPrices[asset.symbol] || prices[asset.symbol] || 0) : asset.balance,
      price: assetPrices[asset.symbol] || prices[asset.symbol] || 0
    };
  });

  // Sort assets: first show assets with balances, then the rest
  const sortedAssets = [...assets].sort((a, b) => {
    // First compare if either asset has a balance
    const aHasBalance = parseFloat(a.amount) > 0;
    const bHasBalance = parseFloat(b.amount) > 0;

    if (aHasBalance && !bHasBalance) return -1;
    if (!aHasBalance && bHasBalance) return 1;

    // If both have or don't have balances, sort by value
    return b.balance - a.balance;
  });

  return (
    <DashboardLayout>
      <div className="space-y-4 px-2 sm:px-4 pb-20">
        <PortfolioAnalytics />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-xl sm:text-2xl">Portfolio Overview</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="grid gap-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold">
                      {!dataReady ? (
                        <span className="text-white/60">Loading...</span>
                      ) : (
                        `$${totalPortfolioValue.toFixed(2)}`
                      )}
                    </div>
                    <div className="text-sm text-white/60">Total Portfolio Value</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-semibold ${totalPortfolioValue >= previousDayBalance ? 'text-green-400' : 'text-red-400'}`}>
                      {totalPortfolioValue >= previousDayBalance ? '+' : ''}
                      ${(totalPortfolioValue - previousDayBalance).toFixed(2)}
                    </div>
                    <div className="text-sm text-white/60">24h Change</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-lg font-semibold">{(balance + (userAssets.USDT?.amount || 0)).toFixed(2)} USDT</div>
                    <div className="text-sm text-white/60">Available Balance</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-lg font-semibold">${(totalPortfolioValue - balance - (userAssets.USDT?.amount || 0)).toFixed(2)}</div>
                    <div className="text-sm text-white/60">In Other Assets</div>
                  </div>
                </div>

                {/* Portfolio Performance Metrics */}
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-white/60">Portfolio Change</div>
                      <div className={`text-sm ${totalPortfolioValue >= previousDayBalance ? 'text-green-400' : 'text-red-400'}`}>
                        {previousDayBalance > 0 ? ((totalPortfolioValue - previousDayBalance) / previousDayBalance * 100).toFixed(2) : '0.00'}%
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-white/40">
                      Previous Day Balance: ${previousDayBalance.toFixed(2)}
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-white/60">ROI</div>
                      <div className={`text-sm ${(totalPortfolioValue - balance) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {balance > 0 ? (((totalPortfolioValue - balance) / balance) * 100).toFixed(2) : '0.00'}%
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-white/40">
                      Initial Investment: ${balance.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Portfolio Analytics */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 mt-4">
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-xs md:text-sm text-white/60">Most Profitable</div>
                    <div className="mt-1 md:mt-2 text-base md:text-lg font-semibold">
                      {sortedAssets.length > 0 ? sortedAssets[0].symbol : '-'}
                    </div>
                    <div className="text-xs text-white/40">
                      ${sortedAssets.length > 0 ? sortedAssets[0].balance.toFixed(2) : '0.00'}
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-xs md:text-sm text-white/60">Portfolio Diversity</div>
                    <div className="mt-1 md:mt-2 text-base md:text-lg font-semibold">
                      {sortedAssets.filter(a => parseFloat(a.amount) > 0).length}
                    </div>
                    <div className="text-xs text-white/40">
                      Assets Held
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-sm text-white/60">Risk Level</div>
                    <div className="mt-2 text-lg font-semibold">
                      {sortedAssets.filter(a => parseFloat(a.amount) > 0).length < 3 ? 'High' : 
                       sortedAssets.filter(a => parseFloat(a.amount) > 0).length < 5 ? 'Medium' : 'Low'}
                    </div>
                    <div className="text-xs text-white/40">
                      Based on Diversity
                    </div>
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
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={sortedAssets}>
                  <XAxis dataKey="symbol" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="balance" fill="#8884d8" name="Balance" />
                  <Line yAxisId="right" type="monotone" dataKey="value" stroke="#82ca9d" name="Value (USD)" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {sortedAssets
                .filter(asset => parseFloat(asset.amount) > 0)
                .map((asset, index, arr) => {
                  const total = arr.reduce((sum, a) => sum + a.balance, 0);
                  return (
                    <div key={asset.symbol} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: `hsl(${index * (360 / arr.length)}, 70%, 50%)` }}
                        />
                        <span>{asset.symbol}</span>
                      </div>
                      <span>{((asset.balance / total) * 100).toFixed(1)}%</span>
                    </div>
                  );
                })}
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
                <div className="rounded-lg border border-white/10">
                  <div className="grid grid-cols-3 p-3 text-xs sm:text-sm font-medium text-white/60">
                    <div>Coin</div>
                    <div className="text-right">Amount</div>
                    <div className="text-right">Price</div>
                  </div>
                  <div className="divide-y divide-white/10">
                    {sortedAssets.map((asset, index) => {
                      // Get the amount from user assets or use default
                      const userAssetAmount = userAssets[asset.symbol]?.amount || 0;
                      // Use the actual amount from userAssets if available
                      const displayAmount = userAssetAmount > 0 ? userAssetAmount.toFixed(8) : asset.amount;

                      return (
                        <div key={index} className="grid grid-cols-3 p-3">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <img
                              src={`https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/${asset.symbol.toLowerCase()}.svg`}
                              alt={asset.symbol}
                              className="w-5 h-5 sm:w-6 sm:h-6"
                              onError={(e) => {
                                e.currentTarget.src = "https://assets.coingecko.com/coins/images/31069/small/worldcoin.jpeg";
                              }}
                            />
                            <div>
                              <div className="text-sm sm:text-base">{asset.symbol}</div>
                              <div className="text-xs text-white/60 hidden sm:block">{asset.fullName}</div>
                            </div>
                          </div>
                          <div className="text-right text-xs sm:text-sm overflow-hidden text-ellipsis">
                            {displayAmount}
                          </div>
                          <div className="text-right text-xs sm:text-sm">
                            ${asset.symbol === 'USDT' ? '1.00' : assetPrices[asset.symbol]?.toFixed(2) || prices[asset.symbol]?.toFixed(2) || '0.00'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
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