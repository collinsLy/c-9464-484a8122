import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import MarketChart from "@/components/dashboard/MarketChart";
import BinanceOrderBook from "@/components/markets/BinanceOrderBook";

const Dashboard = () => {
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSD");
  const [selectedTimeframe, setSelectedTimeframe] = useState("1D");

  const handleSymbolChange = (symbol: string) => {
    setSelectedSymbol(symbol);
  };

  const handleTimeframeChange = (timeframe: string) => {
    setSelectedTimeframe(timeframe);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Trading Dashboard</h1>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <MarketChart 
              selectedSymbol={selectedSymbol}
              selectedTimeframe={selectedTimeframe}
              onSymbolChange={handleSymbolChange}
              onTimeframeChange={handleTimeframeChange}
            />
          </div>
          <div className="xl:col-span-1">
            <BinanceOrderBook symbol={selectedSymbol} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;