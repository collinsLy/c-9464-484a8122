
import { useState, useEffect, useMemo } from "react";
import { UserService } from "@/lib/firebase-service";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PortfolioAnalytics } from "@/components/dashboard/PortfolioAnalytics";
import { useBalanceStore } from "@/hooks/useBalanceStore";
import AssetsList from "@/components/dashboard/AssetsList";
import { BASE_ASSETS } from "@/lib/constants";

const AssetsPage = () => {
  const {
    totalPortfolioValue,
    usdtBalance,
    userAssets,
    assetPrices,
    isLoading: balanceLoading,
    error: balanceError
  } = useBalanceStore();

  const [previousDayBalance, setPreviousDayBalance] = useState(0);

  // Base assets list that will be shown to all users
  const baseAssets = BASE_ASSETS.map(asset => ({
    ...asset,
    balance: asset.symbol === "USDT" ? usdtBalance : 0,
    amount: asset.symbol === "USDT" ? usdtBalance.toFixed(8) : "0.00000000"
  }));

  useEffect(() => {
    const uid = localStorage.getItem('userId');
    if (!uid) return;

    const unsubscribe = UserService.subscribeToUserData(uid, (userData) => {
      if (userData?.previousDayBalance) {
        setPreviousDayBalance(userData.previousDayBalance);
      }
    });

    return () => unsubscribe();
  }, []);

  // Merge base assets with user's actual assets data
  const assets = baseAssets.map(asset => {
    // Check if user has this asset
    const userAsset = userAssets[asset.symbol];

    return {
      ...asset,
      // Override amount and balance if user has this asset
      amount: userAsset ? userAsset.amount.toFixed(8) : asset.amount,
      balance: userAsset ? userAsset.amount * (assetPrices[asset.symbol] || 0) : asset.balance,
      price: assetPrices[asset.symbol] || 0
    };
  });

  // Sort assets: first show assets with balances, then the rest
  const sortedAssets = useMemo(() => {
    return [...assets].sort((a, b) => {
      // First compare if either asset has a balance
      const aHasBalance = parseFloat(a.amount) > 0;
      const bHasBalance = parseFloat(b.amount) > 0;

      if (aHasBalance && !bHasBalance) return -1;
      if (!aHasBalance && bHasBalance) return 1;

      // If both have or don't have balances, sort by value
      return b.balance - a.balance;
    });
  }, [assets]);

  if (balanceError) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px] text-center">
          <div className="text-red-400">
            <p>Error loading balance data</p>
            <p className="text-sm text-white/60 mt-2">{balanceError}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (balanceLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </DashboardLayout>
    );
  }

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
                    <div className="text-2xl sm:text-3xl font-bold">${totalPortfolioValue.toFixed(2)}</div>
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
                    <div className="text-lg font-semibold">{usdtBalance.toFixed(2)} USDT</div>
                    <div className="text-sm text-white/60">Available Balance</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-lg font-semibold">${(totalPortfolioValue - usdtBalance).toFixed(2)}</div>
                    <div className="text-sm text-white/60">In Other Assets</div>
                  </div>
                </div>

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
                      <div className={`text-sm ${(totalPortfolioValue - usdtBalance) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {usdtBalance > 0 ? (((totalPortfolioValue - usdtBalance) / usdtBalance) * 100).toFixed(2) : '0.00'}%
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-white/40">
                      Initial Investment: ${usdtBalance.toFixed(2)}
                    </div>
                  </div>
                </div>

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
                    <div className="text-xs text-white/40">Assets Held</div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-xs md:text-sm text-white/60">Risk Level</div>
                    <div className="mt-1 md:mt-2 text-base md:text-lg font-semibold">
                      {sortedAssets.filter(a => parseFloat(a.amount) > 0).length < 3 ? 'High' : 
                       sortedAssets.filter(a => parseFloat(a.amount) > 0).length < 5 ? 'Medium' : 'Low'}
                    </div>
                    <div className="text-xs text-white/40">Based on Diversity</div>
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
                    <Line yAxisId="right" type="monotone" dataKey="balance" stroke="#82ca9d" name="Value (USD)" />
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
                        <span>{total > 0 ? ((asset.balance / total) * 100).toFixed(1) : '0.0'}%</span>
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
                <AssetsList />
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
