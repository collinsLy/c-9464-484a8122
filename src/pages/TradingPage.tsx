import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDashboardContext } from "@/components/dashboard/DashboardLayout";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import TradingViewChart from "@/components/TradingViewChart";
import BinanceOrderBook from "@/components/markets/BinanceOrderBook";
import { TradingPanel } from "@/components/trading/TradingPanel";
import { CryptoTicker } from "@/components/CryptoTicker";

const TradingPage = () => {
  const { isDemoMode } = useDashboardContext();
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSD");

  const handleSymbolChange = (symbol: string) => {
    const validSymbols = ["BTCUSD", "ETHUSD", "SOLUSD", "BNBUSD", "ADAUSD", "DOTUSD"];
    if (validSymbols.includes(symbol)) {
      setSelectedSymbol(symbol);
    }
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

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
          <div className="xl:col-span-3 space-y-4">
            <Card className="bg-background/40 backdrop-blur-lg border-white/10">
              <CardContent className="p-4">
                <TradingViewChart symbol={selectedSymbol} />
              </CardContent>
            </Card>

            <CryptoTicker />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <div className="xl:col-span-2">
                <TradingPanel symbol={selectedSymbol} />
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
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TradingPage;