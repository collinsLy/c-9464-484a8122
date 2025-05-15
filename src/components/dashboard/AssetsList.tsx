import { useEffect, useState } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserService } from "@/lib/firebase-service";

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
  const [assetPrices, setAssetPrices] = useState<Record<string, number>>({});

  // Fetch current prices for assets
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
      } catch (error) {
        console.error('Error fetching asset prices:', error);
      }
    };

    fetchPrices();
    // Update prices every 30 seconds
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, []);

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

        // Add other assets with accurate price data
        if (userData.assets) {
          Object.entries(userData.assets).forEach(([symbol, data]: [string, any]) => {
            const amount = data.amount || 0;
            const price = assetPrices[symbol] || 0;
            const valueInUsdt = amount * price;

            assets.push({
              id: symbol.toLowerCase(),
              name: symbol,
              symbol: symbol,
              balance: amount,
              value: valueInUsdt, // Calculate actual value based on current price
              price: price, // Store current price
              change: 0, // You could calculate this if you store historical prices
              logoUrl: `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/${symbol.toLowerCase()}.svg`
            });
          });
        }
        setLiveAssets(assets);
      }
    });

    return () => unsubscribe();
  }, [isDemoMode, assetPrices]);

  const assets = isDemoMode ? demoAssets : liveAssets;

  return (
    <Card className="bg-background/40 backdrop-blur-lg border-white/10 h-full">
    <CardHeader className="pb-1 sm:pb-2 p-3 sm:p-6">
      <CardTitle className="text-base sm:text-lg font-semibold text-white flex items-center justify-between">
        <span>Assets</span>
        <Button variant="ghost" size="sm" className="text-white/70 hover:text-white p-0 h-7 w-7 sm:h-8 sm:w-8">
          <RefreshCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>
      </CardTitle>
    </CardHeader>
    <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
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
                  <div className="font-medium">${asset.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  {asset.symbol !== 'USDT' && (
                    <div className="text-sm text-white/60">
                      @ ${asset.price?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}/coin
                    </div>
                  )}
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