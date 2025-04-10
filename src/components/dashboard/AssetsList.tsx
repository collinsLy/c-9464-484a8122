
import { useEffect, useState } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserService } from "@/lib/firebase-service";
import { binanceService } from "@/lib/binance-service";

interface AssetsListProps {
  isDemoMode?: boolean;
}

const AssetsList = ({ isDemoMode = false }: AssetsListProps) => {
  const [userBalance, setUserBalance] = useState(0);
  
  useEffect(() => {
    const uid = localStorage.getItem('userId');
    if (!uid || isDemoMode) return;

    const unsubscribe = UserService.subscribeToUserData(uid, (userData) => {
      if (userData) {
        const balance = typeof userData.balance === 'number' ? userData.balance : parseFloat(userData.balance);
        setUserBalance(balance || 0);
      }
    });

    return () => unsubscribe();
  }, [isDemoMode]);

  // Demo assets with predefined values
  const demoAssets = [
    { id: 1, name: "Bitcoin", symbol: "BTC", balance: 0.05, value: 3271.61, change: 1.24 },
    { id: 2, name: "Ethereum", symbol: "ETH", balance: 1.5, value: 4868.51, change: 2.38 },
    { id: 3, name: "Solana", symbol: "SOL", balance: 14.8, value: 2255.96, change: 3.42 },
    { id: 4, name: "Cardano", symbol: "ADA", balance: 450, value: 265.50, change: -0.87 },
    { id: 5, name: "BNB", symbol: "BNB", balance: 2.2, value: 1332.72, change: 0.75 },
  ];
  
  const [liveAssets, setLiveAssets] = useState([]);

  useEffect(() => {
    const uid = localStorage.getItem('userId');
    if (!uid || isDemoMode) return;

    const unsubscribe = UserService.subscribeToUserData(uid, (userData) => {
      if (userData) {
        const assets = [];
        // Add USDT balance
        if (userData.balance > 0) {
          assets.push({
            id: 'usdt',
            name: "Tether",
            symbol: "USDT",
            balance: userData.balance,
            value: userData.balance,
            change: 0,
            logoUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e9/Tether_USDT.png"
          });
        }
        
        // Add other assets
        if (userData.assets) {
          const entries = Object.entries(userData.assets);
          for (const [symbol, data] of entries) {
            try {
              const price = await binanceService.getPrice(`${symbol}USDT`);
              const priceValue = parseFloat(price.price) || 1;
              assets.push({
                id: symbol.toLowerCase(),
                name: symbol,
                symbol: symbol,
                balance: data.amount,
                value: data.amount * priceValue,
                change: 0,
                logoUrl: `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/${symbol.toLowerCase()}.svg`
              });
            } catch (error) {
              console.error(`Error fetching price for ${symbol}:`, error);
              assets.push({
                id: symbol.toLowerCase(),
                name: symbol,
                symbol: symbol,
                balance: data.amount,
                value: data.amount,
                change: 0,
                logoUrl: `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/${symbol.toLowerCase()}.svg`
              });
            }
          }
        }
        setLiveAssets(assets);
      }
    });

    return () => unsubscribe();
  }, [isDemoMode]);
  
  const assets = isDemoMode ? demoAssets : liveAssets;
  
  return (
    <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white h-full">
      <CardHeader>
        <CardTitle>{isDemoMode ? "Demo Assets" : "Your Assets"}</CardTitle>
      </CardHeader>
      <CardContent className="px-2">
        {assets.length > 0 ? (
          <div className="space-y-4">
            {assets.map((asset) => (
              <div 
                key={asset.id} 
                className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center">
                  {asset.logoUrl ? (
                    <img src={asset.logoUrl} alt={asset.symbol} className="w-8 h-8 rounded-full mr-3" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center mr-3">
                      {asset.symbol.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div className="font-medium">{asset.name}</div>
                    <div className="text-sm text-white/60">{asset.balance.toFixed(2)} {asset.symbol}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">${asset.value.toLocaleString()}</div>
                  <div className={`text-sm flex items-center justify-end ${asset.change > 0 ? 'text-green-400' : asset.change < 0 ? 'text-red-400' : 'text-white/60'}`}>
                    {asset.change !== 0 && (
                      <>
                        {asset.change > 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                        {asset.change > 0 ? '+' : ''}{asset.change}%
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-white/60">
            <p>No assets found</p>
            <p className="text-sm mt-2">Deposit funds to start trading</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AssetsList;
