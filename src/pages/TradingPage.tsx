import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardContext } from "@/components/dashboard/DashboardLayout";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import TradingViewChart from "@/components/TradingViewChart";
import BinanceOrderBook from "@/components/markets/BinanceOrderBook";
import { TradingPanel } from "@/components/trading/TradingPanel";
import { CryptoTicker } from "@/components/CryptoTicker";
import { VerticalPriceTicker } from "@/components/markets/VerticalPriceTicker";

const TradingPage = () => {
  const { isDemoMode } = useDashboardContext();
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSDT");
  const [selectedTimeframe, setSelectedTimeframe] = useState("1D");

  const timeframes = ["1m", "5m", "15m", "1h", "4H", "1D", "1W"];

  return (
    <DashboardLayout>
      <div className="space-y-2">
        <div className="flex justify-between items-center bg-background/40 p-4 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{selectedSymbol}</h2>
                <span className="text-red-500">-1.26%</span>
              </div>
              <span className="text-2xl font-bold text-white">76,998.25</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {timeframes.map((tf) => (
              <button
                key={tf}
                onClick={() => setSelectedTimeframe(tf)}
                className={`px-3 py-1 rounded ${
                  selectedTimeframe === tf 
                    ? "bg-white/10 text-white" 
                    : "text-white/60 hover:text-white"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 bg-background/40 p-4 rounded-lg">
          <div className="col-span-3">
            <TradingViewChart 
              symbol={selectedSymbol} 
              exchange="BINANCE"
              theme="dark"
              containerId="trading_chart"
            />
          </div>

        <div className="col-span-1 space-y-4">
            <BinanceOrderBook symbol={selectedSymbol} />
            <TradingPanel symbol={selectedSymbol} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <CryptoTicker />
          <VerticalPriceTicker />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TradingPage;