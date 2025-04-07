import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardContext } from "@/components/dashboard/DashboardLayout";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import TradingViewChart from "@/components/TradingViewChart";
import BinanceOrderBook from "@/components/markets/BinanceOrderBook";
import { TradingPanel } from "@/components/trading/TradingPanel";
import { CryptoTicker } from "@/components/CryptoTicker";

const MarketPage = () => {
  const { isDemoMode } = useDashboardContext();
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSD");

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Trading Terminal</h1>
            <p className="text-sm text-white/70 mt-1">Execute trades with precision</p>
          </div>
          <select 
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
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

        <Card className="bg-background/40 backdrop-blur-lg border-white/10">
          <CardContent className="p-4">
            <TradingViewChart symbol={selectedSymbol} />
          </CardContent>
        </Card>

        <CryptoTicker />

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <TradingPanel symbol={selectedSymbol} />
          </div>
          <div className="col-span-1">
            <BinanceOrderBook symbol={selectedSymbol} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MarketPage;