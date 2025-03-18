
import { useState, useEffect } from "react";
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
    const validSymbols = ["BTCUSD", "ETHUSD", "SOLUSD", "BNBUSD", "ADAUSD", "DOTUSD"];
    if (validSymbols.includes(symbol)) {
      setSelectedSymbol(symbol);
    }
  };

  const handleTimeframeChange = (timeframe: string) => {
    setSelectedTimeframe(timeframe);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Market Overview</h1>
          <div className="flex space-x-2">
            <select 
              value={selectedSymbol}
              onChange={(e) => handleSymbolChange(e.target.value)}
              className="bg-background/40 text-white border border-white/10 rounded-md p-2"
            >
              <option value="BTCUSD">BTC/USD</option>
              <option value="ETHUSD">ETH/USD</option>
              <option value="SOLUSD">SOL/USD</option>
              <option value="BNBUSD">BNB/USD</option>
              <option value="ADAUSD">ADA/USD</option>
              <option value="DOTUSD">DOT/USD</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <MarketChart 
              selectedSymbol={selectedSymbol} 
              selectedTimeframe={selectedTimeframe}
              onSymbolChange={handleSymbolChange}
              onTimeframeChange={handleTimeframeChange}
            />
            {isDemoMode && <TradingPanel symbol={selectedSymbol} />}
          </div>

          <div className="xl:col-span-1">
            <BinanceOrderBook symbol={selectedSymbol} />
          </div>
        </div>

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
