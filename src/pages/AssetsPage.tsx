
import { useState, useEffect } from "react";
import { UserService } from "@/lib/firebase-service";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

const AssetsPage = () => {
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [profitLoss, setProfitLoss] = useState(0);
  const [selectedCrypto, setSelectedCrypto] = useState("BTC");

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
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const assets = [
    {
      name: "BTC",
      symbol: "BTC",
      fullName: "Bitcoin",
      balance: balance * 0.000037,
      amount: (balance * 0.000037).toFixed(8),
      price: 27000.00
    },
    {
      name: "USDT",
      symbol: "USDT",
      fullName: "TetherUS",
      balance: balance,
      amount: balance.toFixed(8),
      price: 1.00
    },
    {
      name: "BNB",
      symbol: "BNB",
      fullName: "Binance Coin",
      balance: balance * 0.0033,
      amount: (balance * 0.0033).toFixed(8),
      price: 300.00
    },
    {
      name: "WLD",
      symbol: "WLD",
      fullName: "Worldcoin",
      balance: balance * 0.5,
      amount: (balance * 0.5).toFixed(8),
      price: 2.00
    },
    {
      name: "USDC",
      symbol: "USDC",
      fullName: "USD Coin",
      balance: balance * 0.8,
      amount: (balance * 0.8).toFixed(8),
      price: 1.00
    },
    {
      name: "SOL",
      symbol: "SOL",
      fullName: "Solana",
      balance: balance * 0.015,
      amount: (balance * 0.015).toFixed(8),
      price: 66.00
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
          <CardHeader>
            <CardTitle>Estimated Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold">{balance.toFixed(8)} USDT</div>
              <div className="text-sm text-white/60">≈ ${balance.toFixed(2)}</div>
              <div className="flex items-center gap-2 text-sm">
                <span>Today's PnL</span>
                <span className={`${profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {profitLoss >= 0 ? '+' : ''}{profitLoss.toFixed(2)} ({(profitLoss / balance * 100).toFixed(2)}%)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
          <CardHeader>
            <CardTitle>Available Cryptocurrencies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap mb-6">
              <Button 
                variant={selectedCrypto === 'BTC' ? 'secondary' : 'outline'}
                onClick={() => setSelectedCrypto('BTC')}
                className="flex items-center gap-2"
              >
                <img src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/btc.svg" alt="BTC" className="w-5 h-5" />
                BTC
              </Button>
              <Button 
                variant={selectedCrypto === 'USDT' ? 'secondary' : 'outline'}
                onClick={() => setSelectedCrypto('USDT')}
                className="flex items-center gap-2"
              >
                <img src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/usdt.svg" alt="USDT" className="w-5 h-5" />
                USDT
              </Button>
              <Button 
                variant={selectedCrypto === 'BNB' ? 'secondary' : 'outline'}
                onClick={() => setSelectedCrypto('BNB')}
                className="flex items-center gap-2"
              >
                <img src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/bnb.svg" alt="BNB" className="w-5 h-5" />
                BNB
              </Button>
              <Button 
                variant={selectedCrypto === 'WLD' ? 'secondary' : 'outline'}
                onClick={() => setSelectedCrypto('WLD')}
                className="flex items-center gap-2"
              >
                <img src="https://assets.coingecko.com/coins/images/31069/small/worldcoin.jpeg" alt="WLD" className="w-5 h-5" />
                WLD
              </Button>
              <Button 
                variant={selectedCrypto === 'USDC' ? 'secondary' : 'outline'}
                onClick={() => setSelectedCrypto('USDC')}
                className="flex items-center gap-2"
              >
                <img src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/usdc.svg" alt="USDC" className="w-5 h-5" />
                USDC
              </Button>
              <Button 
                variant={selectedCrypto === 'SOL' ? 'secondary' : 'outline'}
                onClick={() => setSelectedCrypto('SOL')}
                className="flex items-center gap-2"
              >
                <img src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/sol.svg" alt="SOL" className="w-5 h-5" />
                SOL
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
          <CardHeader>
            <CardTitle>My Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="coin-view">
              <TabsList className="bg-background/40">
                <TabsTrigger value="coin-view">Coin View</TabsTrigger>
                <TabsTrigger value="account-view">Account View</TabsTrigger>
              </TabsList>
              <TabsContent value="coin-view" className="pt-4">
                <div className="rounded-lg border border-white/10">
                  <div className="grid grid-cols-3 p-3 text-sm font-medium text-white/60">
                    <div>Coin</div>
                    <div className="text-right">Amount</div>
                    <div className="text-right">Price/Cost</div>
                  </div>
                  <div className="divide-y divide-white/10">
                    {assets.map((asset, index) => (
                      <div key={index} className="grid grid-cols-3 p-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={`https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/${asset.symbol.toLowerCase()}.svg`}
                            alt={asset.symbol}
                            className="w-6 h-6"
                            onError={(e) => {
                              e.currentTarget.src = "https://assets.coingecko.com/coins/images/31069/small/worldcoin.jpeg";
                            }}
                          />
                          <div>
                            <div>{asset.symbol}</div>
                            <div className="text-sm text-white/60">{asset.fullName}</div>
                          </div>
                        </div>
                        <div className="text-right">{asset.amount}</div>
                        <div className="text-right">${asset.price.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
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
