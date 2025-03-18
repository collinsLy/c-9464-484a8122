
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MarketChart from "@/components/dashboard/MarketChart";
import TradingPanel from "@/components/dashboard/TradingPanel";
import { getTopCoins } from "@/lib/api/coingecko";
import DemoBotGrid from "@/components/demo/DemoBotGrid";
import TradingViewChart from "@/components/TradingViewChart";

const DemoPage = () => {
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSD");
  const [selectedTimeframe, setSelectedTimeframe] = useState("1D");
  
  // Fetch top coins for market data
  const { data: topCoins, isLoading } = useQuery({
    queryKey: ['topCoins'],
    queryFn: () => getTopCoins(),
  });
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
          <CardHeader>
            <CardTitle>Demo Trading Platform</CardTitle>
            <CardDescription className="text-white/70">
              Practice trading with virtual funds. No real money is used.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-4">
              Current Demo Balance: ${parseFloat(localStorage.getItem('demoBalance') || '10000').toFixed(2)}
            </div>
            <p className="text-white/70">
              Use this demo environment to practice trading strategies and test our platform features without risking real funds.
            </p>
          </CardContent>
        </Card>

        <Tabs defaultValue="chart" className="w-full">
          <TabsList className="bg-background/40 backdrop-blur-lg border-white/10 text-white mb-6">
            <TabsTrigger value="chart" className="text-white data-[state=active]:bg-accent">
              Live Chart
            </TabsTrigger>
            <TabsTrigger value="trading-bots" className="text-white data-[state=active]:bg-accent">
              Trading Bots
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="chart" className="mt-0 space-y-6">
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
                <TradingPanel symbol={selectedSymbol} isDemoMode={true} />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="trading-bots" className="mt-0">
            <DemoBotGrid />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default DemoPage;
