
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardContext } from "@/components/dashboard/DashboardLayout";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import TradingViewChart from "@/components/TradingViewChart";
import BinanceOrderBook from "@/components/markets/BinanceOrderBook";
import { TradingPanel } from "@/components/trading/TradingPanel";
import { CryptoTicker } from "@/components/CryptoTicker";
import { toast } from "sonner";

interface StockData {
  symbol: string;
  price: string;
  change: string;
  changePercent: string;
}

const MarketPage = () => {
  const { isDemoMode } = useDashboardContext();
  const [selectedSymbol, setSelectedSymbol] = useState("IBM");
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStockData = async () => {
    try {
      const response = await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${selectedSymbol}&apikey=${process.env.VITE_ALPHA_VANTAGE_API_KEY}`
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
    const interval = setInterval(fetchStockData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [selectedSymbol]);

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Trading Terminal</h1>
            <p className="text-sm text-white/70 mt-1">Stock & Crypto Trading</p>
          </div>
          <select 
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
            className="bg-background/40 text-white border border-white/10 rounded-md p-2"
          >
            <option value="IBM">IBM</option>
            <option value="AAPL">Apple</option>
            <option value="GOOGL">Google</option>
            <option value="MSFT">Microsoft</option>
            <option value="AMZN">Amazon</option>
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
