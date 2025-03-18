import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useDashboardContext } from "@/components/dashboard/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MarketChart from "@/components/dashboard/MarketChart";
import TradingPanel from "@/components/dashboard/TradingPanel";
import MarketOverview from "@/components/markets/MarketOverview";
import BinanceOrderBook from "@/components/markets/BinanceOrderBook";
import CoinGeckoData from "@/components/markets/CoinGeckoData";
import MarketNews from "@/components/markets/MarketNews";

const MarketPage = () => {
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSD");
  const [selectedTimeframe, setSelectedTimeframe] = useState("1D");
  const { isDemoMode } = useDashboardContext();

  const handleSymbolChange = (symbol: string) => {
    // Filter out unwanted symbols
    const allowedSymbols = ["BTCUSD", "SOLUSD", "BNBUSD", "ADAUSD", "DOTUSD"];
    if (allowedSymbols.includes(symbol)) {
      setSelectedSymbol(symbol);
    }
  };

  const handleTimeframeChange = (timeframe: string) => {
    setSelectedTimeframe(timeframe);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Market Overview</h1>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main chart and trading panel */}
          <div className="xl:col-span-2 space-y-6">
            <MarketChart 
              selectedSymbol={selectedSymbol} 
              selectedTimeframe={selectedTimeframe}
              onSymbolChange={handleSymbolChange}
              onTimeframeChange={handleTimeframeChange}
            />
          </div>

          {/* Order Book */}
          <div className="xl:col-span-1">
            <BinanceOrderBook symbol={selectedSymbol} />
          </div>
        </div>

        {/* Market data tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-background/40 backdrop-blur-lg border-white/10 text-white mb-6">
            <TabsTrigger value="overview" className="text-white data-[state=active]:bg-accent">
              Market Overview
            </TabsTrigger>
            <TabsTrigger value="orderbook" className="text-white data-[state=active]:bg-accent">
              Order Book
            </TabsTrigger>
            <TabsTrigger value="coingecko" className="text-white data-[state=active]:bg-accent">
              CoinGecko Data
            </TabsTrigger>
            <TabsTrigger value="news" className="text-white data-[state=active]:bg-accent">
              Market News
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-0">
            <MarketOverview />
          </TabsContent>

          <TabsContent value="orderbook" className="mt-0">
            <BinanceOrderBook symbol={selectedSymbol} />
          </TabsContent>

          <TabsContent value="coingecko" className="mt-0">
            <CoinGeckoData symbol={selectedSymbol} />
          </TabsContent>

          <TabsContent value="news" className="mt-0">
            <MarketNews />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default MarketPage;