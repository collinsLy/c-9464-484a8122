
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BASE_ASSETS } from "@/lib/constants";

const AssetsPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [assetPrices, setAssetPrices] = useState<Record<string, number>>({});
  const [userBalance] = useState(1000); // Demo balance

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch('/api/binance/prices');
        if (response.ok) {
          const data = await response.json();
          const prices: Record<string, number> = { 'USDT': 1.00, 'USDC': 1.00 };
          
          data.forEach((item: any) => {
            if (item.symbol.endsWith('USDT')) {
              const symbol = item.symbol.replace('USDT', '');
              if (BASE_ASSETS.some(asset => asset.symbol === symbol)) {
                prices[symbol] = parseFloat(item.price);
              }
            }
          });
          
          setAssetPrices(prices);
        }
      } catch (error) {
        console.error('Error fetching prices:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 px-4 pb-20">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-2xl">Portfolio Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-3xl font-bold">${userBalance.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">Total Portfolio Value</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-green-400">+$0.00</div>
                  <div className="text-sm text-muted-foreground">24h Change</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-2xl">Available Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="coin-view">
              <TabsList className="w-full mb-4">
                <TabsTrigger value="coin-view" className="flex-1">Coin View</TabsTrigger>
                <TabsTrigger value="account-view" className="flex-1">Account View</TabsTrigger>
              </TabsList>
              <TabsContent value="coin-view">
                <div className="space-y-2">
                  {BASE_ASSETS.map((asset) => (
                    <div key={asset.symbol} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-xs font-bold">{asset.symbol.slice(0, 2)}</span>
                        </div>
                        <div>
                          <div className="font-medium">{asset.name}</div>
                          <div className="text-sm text-muted-foreground">{asset.symbol}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          ${assetPrices[asset.symbol]?.toFixed(2) || '0.00'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          0.00000000 {asset.symbol}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="account-view">
                <div className="text-center py-12 text-muted-foreground">
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
