import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardContext } from "@/components/dashboard/DashboardLayout";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import TradingViewChart from "@/components/TradingViewChart";

import { TradingPanel } from "@/components/trading/TradingPanel";
import { CryptoTicker } from "@/components/CryptoTicker";
import MarketOverview from "@/components/markets/MarketOverview";
import CoinGeckoData from "@/components/markets/CoinGeckoData";
import MarketNews from "@/components/markets/MarketNews";
import { LivePriceTicker } from "@/components/markets/LivePriceTicker";

import { TwelveDataTicker } from "@/components/markets/TwelveDataTicker";
import { toast } from "sonner";
import { StockTicker } from '@/components/markets/StockTicker';

// StockData interface removed

const MarketPage = () => {
  const { isDemoMode } = useDashboardContext();
  const [selectedCryptoSymbol, setSelectedCryptoSymbol] = useState("BTCUSDT");

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          {/* Crypto Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Crypto</h2>
              <select 
                value={selectedCryptoSymbol}
                onChange={(e) => setSelectedCryptoSymbol(e.target.value)}
                className="bg-background/40 text-white border border-white/10 rounded-md p-2"
              >
                <option value="BTCUSDT">BTC/USDT</option>
                <option value="ETHUSDT">ETH/USDT</option>
                <option value="BNBUSDT">BNB/USDT</option>
                <option value="SOLUSDT">SOL/USDT</option>
                <option value="ADAUSDT">ADA/USDT</option>
              </select>
            </div>

            <Card className="bg-background/40 backdrop-blur-lg border-white/10">
              <CardContent className="p-4">
                <TradingViewChart 
                  symbol={selectedCryptoSymbol} 
                  exchange="BINANCE" 
                  containerId="crypto_chart"
                />
              </CardContent>
            </Card>
          </div>

          {/* Stock section removed */}
        </div>

        <CryptoTicker />

      <div className="grid gap-6 mt-6">
        <MarketOverview />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-3">
            <CoinGeckoData symbol={selectedCryptoSymbol} />
          </div>
        </div>

        <MarketNews />
      </div>
      </div>
    </DashboardLayout>
  );
};

export default MarketPage;