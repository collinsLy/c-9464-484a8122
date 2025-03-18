import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { MarketChart } from '@/components/markets/MarketChart';
import { TradingPanel } from '@/components/trading/TradingPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDashboardContext } from '@/components/dashboard/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import { getTopCoins } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';


const MarketPage = () => {
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSD");
  const [selectedTimeframe, setSelectedTimeframe] = useState("1D");
  const { isDemoMode } = useDashboardContext();

  const { data: marketData, isLoading } = useQuery({
    queryKey: ['market-data', selectedSymbol],
    queryFn: () => getTopCoins(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Market Overview</h1>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <MarketChart 
              selectedSymbol={selectedSymbol} 
              selectedTimeframe={selectedTimeframe}
              onSymbolChange={setSelectedSymbol}
              onTimeframeChange={setSelectedTimeframe}
            />
          </div>
          <div className="xl:col-span-1">
            <TradingPanel 
              symbol={selectedSymbol} 
              isDemoMode={isDemoMode} 
              marketData={marketData}
            />
          </div>
        </div>

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Market Overview</TabsTrigger>
            <TabsTrigger value="orderbook">Order Book</TabsTrigger>
            <TabsTrigger value="trading">Trading</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {marketData?.map((coin) => (
                <Card key={coin.id}>
                  <CardHeader>
                    <CardTitle>{coin.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Price: ${coin.price}</p>
                    <p>24h Change: {coin.change24h}%</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default MarketPage;