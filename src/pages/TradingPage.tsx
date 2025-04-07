import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useDashboardContext } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import TradingViewChart from "@/components/TradingViewChart";
import BinanceOrderBook from "@/components/markets/BinanceOrderBook";
import MarketChart from "@/components/dashboard/MarketChart";
import { TradingPanel } from "@/components/trading/TradingPanel";
import MarketOverview from "@/components/markets/MarketOverview";
import CoinGeckoData from "@/components/markets/CoinGeckoData";
import MarketNews from "@/components/markets/MarketNews";
import { CryptoTicker } from "@/components/CryptoTicker";

const TradingPage = () => {
  const { isDemoMode } = useDashboardContext();
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSD");
  const [selectedTimeframe, setSelectedTimeframe] = useState("1D");

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
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Trading Terminal</h1>
            <p className="text-sm text-white/70 mt-1">Execute trades with precision</p>
          </div>
          <div className="flex items-center space-x-4">
            <select 
              value={selectedSymbol}
              onChange={(e) => handleSymbolChange(e.target.value)}
              className="bg-background/40 text-white border border-white/10 rounded-md p-2 min-w-[120px]"
            >
              <option value="BTCUSD">BTC/USD</option>
              <option value="ETHUSD">ETH/USD</option>
              <option value="SOLUSD">SOL/USD</option>
              <option value="BNBUSD">BNB/USD</option>
              <option value="ADAUSD">ADA/USD</option>
              <option value="DOTUSD">DOT/USD</option>
            </select>
            <Button variant="outline" className="bg-background/40 border-white/10 text-white hover:bg-white/10">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
          <div className="xl:col-span-3 space-y-4">
            <div className="space-y-4">
              <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
                <CardContent className="p-4">
                  <MarketChart 
                    selectedSymbol={selectedSymbol} 
                    selectedTimeframe={selectedTimeframe}
                    onSymbolChange={handleSymbolChange}
                    onTimeframeChange={handleTimeframeChange}
                  />
                </CardContent>
              </Card>
              <div className="w-full">
                <CryptoTicker />
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <div className="xl:col-span-2">
                  <TradingPanel symbol={selectedSymbol} />
                </div>
                <div>
                  <BinanceOrderBook symbol={selectedSymbol} />
                </div>
              </div>
            </div>
            
          </div>

          <div className="xl:col-span-1">
            <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white h-full">
              <CardHeader>
                <CardTitle>Order Book</CardTitle>
              </CardHeader>
              <CardContent>
                <BinanceOrderBook symbol={selectedSymbol} />
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white mt-4">
          <CardHeader>
            <CardTitle>Market Data</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="bg-background/40 backdrop-blur-lg border-white/10 text-white mb-4 grid grid-cols-4 w-full">
                <TabsTrigger value="overview" className="text-white data-[state=active]:bg-accent">
                  Market Overview
                </TabsTrigger>
                <TabsTrigger value="orderbook" className="text-white data-[state=active]:bg-accent">
                  Order Book
                </TabsTrigger>
                <TabsTrigger value="coingecko" className="text-white data-[state=active]:bg-accent">
                  Market Data
                </TabsTrigger>
                <TabsTrigger value="news" className="text-white data-[state=active]:bg-accent">
                  Market News
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-0">
                <div className="bg-white/5 rounded-lg p-4">
                  <MarketOverview />
                </div>
              </TabsContent>

              <TabsContent value="orderbook" className="mt-0">
                <div className="bg-white/5 rounded-lg p-4">
                  <BinanceOrderBook symbol={selectedSymbol} />
                </div>
              </TabsContent>

              <TabsContent value="coingecko" className="mt-0">
                <div className="bg-white/5 rounded-lg p-4">
                  <CoinGeckoData symbol={selectedSymbol} />
                </div>
              </TabsContent>

              <TabsContent value="news" className="mt-0">
                <div className="bg-white/5 rounded-lg p-4">
                  <MarketNews />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TradingPage;