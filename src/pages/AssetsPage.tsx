
import { useState, useEffect } from "react";
import { UserService } from "@/lib/firebase-service";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AssetsPage = () => {
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [profitLoss, setProfitLoss] = useState(0);
  const [selectedCrypto, setSelectedCrypto] = useState("BTC");

  const [totalPortfolioValue, setTotalPortfolioValue] = useState(0);
  const [assetPrices, setAssetPrices] = useState<Record<string, number>>({});
  const [userAssets, setUserAssets] = useState<Record<string, any>>({});

  // Fetch current prices for all assets
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const symbols = ['BTC', 'ETH', 'BNB', 'SOL', 'ADA', 'DOGE', 'XRP', 'DOT', 'LINK', 'MATIC'];
        const symbolsQuery = symbols.map(s => `${s}USDT`);
        const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbols=${JSON.stringify(symbolsQuery)}`);
        const data = await response.json();
        
        const prices: Record<string, number> = {};
        data.forEach((item: any) => {
          const symbol = item.symbol.replace('USDT', '');
          prices[symbol] = parseFloat(item.price);
        });
        // Add USDT itself with value of 1
        prices['USDT'] = 1;
        setAssetPrices(prices);
        
        // Recalculate portfolio value when prices update
        calculatePortfolioValue(userAssets, prices, balance);
      } catch (error) {
        console.error('Error fetching asset prices:', error);
      }
    };

    fetchPrices();
    // Update prices every 30 seconds
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, [userAssets, balance]);

  // Calculate total portfolio value with current prices
  const calculatePortfolioValue = (assets: Record<string, any>, prices: Record<string, number>, usdtBalance: number) => {
    let total = usdtBalance; // Start with USDT balance
    
    // Add value of all other assets
    if (assets) {
      Object.entries(assets).forEach(([symbol, data]) => {
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

    const unsubscribe = UserService.subscribeToUserData(uid, (userData) => {
      if (userData) {
        const parsedBalance = typeof userData.balance === 'string' ? parseFloat(userData.balance) : userData.balance;
        setBalance(parsedBalance || 0);
        setUserAssets(userData.assets || {});
        
        // Calculate portfolio value
        calculatePortfolioValue(userData.assets || {}, assetPrices, parsedBalance || 0);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [assetPrices]);

  const [prices, setPrices] = useState({});
  
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
      name: "USDT",
      symbol: "USDT",
      fullName: "TetherUS",
      balance: balance,
      amount: balance.toFixed(8)
    },
    {
      name: "BNB",
      symbol: "BNB",
      fullName: "Binance Coin",
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
      name: "USDC",
      symbol: "USDC",
      fullName: "USD Coin",
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
      name: "ETH",
      symbol: "ETH",
      fullName: "Ethereum",
      balance: 0,
      amount: "0.00000000"
    },
    {
      name: "XRP",
      symbol: "XRP",
      fullName: "Ripple",
      balance: 0,
      amount: "0.00000000"
    }
  ];

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const symbols = baseAssets.map(asset => `${asset.symbol}USDT`);
        const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbols=' + JSON.stringify(symbols));
        const data = await response.json();
        
        const newPrices = {};
        data.forEach(item => {
          const symbol = item.symbol.replace('USDT', '');
          newPrices[symbol] = parseFloat(item.price);
        });
        setPrices(newPrices);
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
        <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-2xl">Estimated Balance</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="space-y-2">
              <div className="text-2xl sm:text-3xl font-bold">${totalPortfolioValue.toFixed(2)}</div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                <div className="text-sm text-white/60">USDT Balance: {balance.toFixed(2)} USDT</div>
                <div className="text-sm text-white/60">Other Assets: ~${(totalPortfolioValue - balance).toFixed(2)}</div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span>Today's PnL</span>
                <span className={`${profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {profitLoss >= 0 ? '+' : ''}{profitLoss.toFixed(2)} ({(profitLoss / (balance || 1) * 100).toFixed(2)}%)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

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
