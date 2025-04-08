import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardContext } from "@/components/dashboard/DashboardLayout";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import TradingViewChart from "@/components/TradingViewChart";
import BinanceOrderBook from "@/components/markets/BinanceOrderBook";
import { TradingPanel } from "@/components/trading/TradingPanel";
import { CryptoTicker } from "@/components/CryptoTicker";
import MarketOverview from "@/components/markets/MarketOverview";
import CoinGeckoData from "@/components/markets/CoinGeckoData";
import MarketNews from "@/components/markets/MarketNews";
import { LivePriceTicker } from "@/components/markets/LivePriceTicker";
import { StockTicker } from "@/components/markets/StockTicker";
import { TwelveDataTicker } from "@/components/markets/TwelveDataTicker";
import { toast } from "sonner";

interface StockData {
  symbol: string;
  price: string;
  change: string;
  changePercent: string;
}

const MarketPage = () => {
  const { isDemoMode } = useDashboardContext();
  const [selectedStockSymbol, setSelectedStockSymbol] = useState("IBM");
  const [selectedCryptoSymbol, setSelectedCryptoSymbol] = useState("BTCUSDT");
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStockData = async () => {
    try {
      const response = await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${selectedStockSymbol}&apikey=${process.env.VITE_ALPHA_VANTAGE_API_KEY}`
      );
      const data = await response.json();

      if (data["Global Quote"]) {
        setStockData({
          symbol: data["Global Quote"]["01. symbol"],
          price: data["Global Quote"]["05. price"],
          change: data["Global Quote"]["09. change"],
          changePercent: data["Global Quote"]["10. change percent"],
        });
      }
      setLoading(false);
    } catch (error) {
      toast.error("Failed to fetch stock data");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockData();
    const interval = setInterval(fetchStockData, 60000);
    return () => clearInterval(interval);
  }, [selectedStockSymbol]);

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Stock Section */}
          <div className="space-y-4 flex flex-col">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Stocks</h2>
              <select 
                value={selectedStockSymbol}
                onChange={(e) => setSelectedStockSymbol(e.target.value)}
                className="bg-background/40 text-white border border-white/10 rounded-md p-2"
              >
                <option value="IBM">IBM</option>
                <option value="AAPL">AAPL</option>
                <option value="GOOGL">GOOGL</option>
                <option value="MSFT">MSFT</option>
                <option value="AMZN">AMZN</option>
              </select>
            </div>

            {stockData && (
              <Card className="bg-background/40 backdrop-blur-lg border-white/10">
                <CardHeader>
                  <CardTitle>{stockData.symbol} Stock Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-white/70">Price</p>
                      <p className="text-2xl font-bold">${parseFloat(stockData.price).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-white/70">Change</p>
                      <p className={`text-2xl font-bold ${parseFloat(stockData.change) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        ${parseFloat(stockData.change).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-white/70">Change %</p>
                      <p className={`text-2xl font-bold ${parseFloat(stockData.changePercent) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {stockData.changePercent}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-background/40 backdrop-blur-lg border-white/10">
              <CardContent className="p-4">
                <TradingViewChart 
                  symbol={selectedStockSymbol} 
                  exchange="NYSE" 
                  containerId="stock_chart"
                />
              </CardContent>
            </Card>

            <TwelveDataTicker />
          </div>

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

            <BinanceOrderBook symbol={selectedCryptoSymbol} />
          </div>
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